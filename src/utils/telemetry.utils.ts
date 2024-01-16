import axios from "axios";
import { telemetryCache, telemetryEnvelop } from "../schemas/cache/telemetry.cache";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";
import axiosRetry from 'axios-retry';
import { v1 } from "uuid";
import { RedisClient } from "./redis.utils";
import { ScanStream } from "ioredis";
axiosRetry(axios, { retries: getConfig().app.httpRetryCount });

const constructCdata = (message: any) => {
    const cdata: any = [];
    if (message.context.hasOwnProperty('location')) {
        Object.entries(message.context.location).map(([dataKey, dataValue]: any) => {
            cdata.push({
                type: dataKey,
                value: dataValue.name,
                valueType: "string"
            });
            cdata.push({
                type: dataKey+"code",
                value: dataValue.code,
                valueType: "string"
            });
        })
    }
    return cdata;
}

export function createTelemetryEvent(message: any) {
    let telemetry = { ...telemetryEnvelop };
    telemetry.ets = Date.now();
    telemetry.mid = v1();
    telemetry.context = {
        channel: getConfig().app.subscriberId,
        domain: message.context.domain,
        pdata: {
            id: getConfig().app.subscriberId,
            uri: getConfig().app.subscriberUri
        },
        source: {
            id: getConfig().app.subscriberId,
            type: getConfig().app.mode === "bap" ? "seeker" : "provider",
            uri: getConfig().app.subscriberUri
        },
        target: {
            id: getConfig().app.mode === "bap" ? message.context.bpp_id : message.context.bap_id,
            type: getConfig().app.mode === "bap" ? "provider" : "seeker",
            uri: getConfig().app.mode === "bap" ? message.context.bpp_uri : message.context.bap_uri
        },
        cdata: constructCdata(message)
    };
    telemetry.data = {
        url: `/${message.context.action}`,
        method: "POST",
        action: message.context.action,
        transactionid: message.context.transaction_id,
        msgid: message.context.message_id,
        exdata: []
    };

    if(message.hasOwnProperty('data') && message.data.hasOwnProperty('statuscode')) telemetry.data["statuscode"] = message.data.statuscode;
    return telemetry;
}

const pushTelemetry = async (payload: Record<string, any>) => {
    try {
        await axios.post(`${getConfig().app.telemetry.url}`, {
            data: {
                id: v1(),
                events: payload,
            }
        })
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error };
    }
}

const processCache = async (client: RedisClient, cacheData: ScanStream | undefined) => {
    let error: any = null;
    cacheData?.on("data", async (resultKeys: string[]) => {
        cacheData.pause();
        const payload = resultKeys.map(async (key: string) => {
            const data = await client.get(key);
            return data
        });
        const response = await pushTelemetry(payload);
        if(response.success) {
            logger.info("Telemetry events pushed successfully");
        } else {
            logger.error("Error while pushing telemetry to server -");
            logger.error(response.error);
            error = response.error;
        }
        cacheData.resume();
    });
    cacheData?.on("end", async () => {
        if(!error) {
            logger.info("Telemetry cache processed successfully, clearing cache");
            await client.flushDB();
        }
    });
}

export async function processTelemetry() {
    const last_sync_time = telemetryCache.get("last_sync_time");
    const settled_messages = {
        bap_client_settled: telemetryCache.get("bap_client_settled"),
        bap_response_settled: telemetryCache.get("bap_response_settled"),
        bpp_client_settled: telemetryCache.get("bpp_client_settled"),
        bpp_request_settled: telemetryCache.get("bpp_request_settled"),
    }
    const now = new Date().getTime();
    const events_count = settled_messages.bap_client_settled.length + 
        settled_messages.bap_response_settled.length + 
        settled_messages.bpp_client_settled.length + 
        settled_messages.bpp_request_settled.length;
    logger.info(`Telemetry events count - ${events_count}`)
    // If last sync time is more than syncInterval(minutes) thens sync
    if (now - last_sync_time > getConfig().app.telemetry.syncInterval * 60 * 1000 || events_count >= getConfig().app.telemetry.batchSize) {
        logger.info("Pushing telemetry to server")
        const payload_data = Object.values(settled_messages).flat();
        const client = new RedisClient(getConfig().app.telemetry.redis_db, true);
        try {
            const response = await pushTelemetry(payload_data);
            if(response.error) throw response.error;
            logger.info("Telemetry events pushed successfully");
            const cacheData = client.getKeys();
            await processCache(client, cacheData);
        } catch (error) {
            logger.error("Error while pushing telemetry to server -");
            logger.error(error);
            await client.set(`cache_${v1()}`, JSON.stringify(payload_data));
        } finally {
            telemetryCache.set("last_sync_time", now);
            telemetryCache.set("bap_client_settled", []);
            telemetryCache.set("bap_response_settled", []);
            telemetryCache.set("bpp_client_settled", []);
            telemetryCache.set("bpp_request_settled", []);
        }
    }
}
