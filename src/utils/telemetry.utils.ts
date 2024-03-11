import { NextFunction, Request, Response } from "express";
import { getConfig } from "./config.utils";
import TelemetrySDK from 'beckn-telemetry-sdk';

export const telemetrySDK = TelemetrySDK

export const getTelemetryConfig = () => {
    return {
        "participantId": getConfig().app.subscriberId,
        "participantUri": getConfig().app.subscriberUri,
        "role": getConfig().app.mode,
        "telemetry": {
            "batchSize": getConfig().app.telemetry.batchSize,
            "syncInterval": getConfig().app.telemetry.syncInterval,
            "retry": getConfig().app.httpRetryCount,
            "storageType": getConfig().app.telemetry.storageType,
            "backupFilePath": getConfig().app.telemetry.backupFilePath,
            "redis": {
                "host": getConfig().cache.host,
                "port": getConfig().cache.port,
                "db": getConfig().app.telemetry.redis.db
            },
            "network": {
                "url": getConfig().app.telemetry.network.url
            },
            "raw": {
                "url": getConfig().app.telemetry.raw.url
            }
        },
        "service": {
            "name": getConfig().app.service.name,
            "version": getConfig().app.service.version
        }
    }
}

export const onAPI = (request: Request, response: Response, next: NextFunction) => {
    const mode = request.get('mode');
    TelemetrySDK.onApi({ data: { attributes: { mode } } })(request, response, next)
}