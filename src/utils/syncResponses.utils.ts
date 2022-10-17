import { Response } from "express";
import { Exception, ExceptionType } from "../models/exception.model";
import { RequestActions } from "../schemas/configs/actions.app.config.schema";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { SyncCache } from "./cache/sync.cache.utils";
import { getConfig } from "./config.utils";

export async function sendSyncResponses(res: Response, message_id:string, action: RequestActions, context: any) {
    try {
        if(getConfig().client.type!=ClientConfigType.synchronous){
            throw new Exception(ExceptionType.Client_InvalidCall, "Synchronous client is not configured.", 500);
        }

        const syncCache=SyncCache.getInstance();
        syncCache.initCache(message_id, action);
        
        const waitTime=(getConfig().app.actions.requests[action]?.ttl) ? getConfig().app.actions.requests[action]?.ttl! : 30*1000;
        await sleep(waitTime);
        
        const syncCacheData=await syncCache.getData(message_id, action);
        if(!syncCacheData){
            throw new Exception(ExceptionType.Client_SyncCacheDataNotFound, `Sync cache data not found for message_id: ${message_id} and action: ${action}`, 404);
        }

        if(syncCacheData.error){
            res.status(400).json({
                context,
                error: syncCacheData.error
            });
            return;
        }

        res.status(200).json({
            context,
            responses: syncCacheData.responses
        });
    } catch (error) {
        if(error instanceof Exception){
            throw error;
        }

        throw new Exception(ExceptionType.Client_SendSyncReponsesFailed, "Send Synchronous Responses Failed.", 500, error);
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}