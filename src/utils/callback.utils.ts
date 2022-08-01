import axios from "axios";
import { Exception, ExceptionType } from "../models/exception.model";
import { becknErrorSchema } from "../schemas/becknError.schema";
import { BecknErrorDataType } from "../schemas/cache/sync.cache.schema";
import { requestCallbackSchema } from "../schemas/callbacks/request.callback.schema";
import { responseCallbackSchema } from "../schemas/callbacks/response.callback.schema";
import { ClientConfigType, WebhookClientConfigDataType } from "../schemas/configs/client.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getConfig } from "./config.utils";

async function makeClientCallback(data:any){
    try {
        if(getConfig().app.gateway.mode!=GatewayMode.client){
            throw new Exception(ExceptionType.Gateway_InvalidUse, "Gateway mode is not client", 500);
        }
    
        if(getConfig().client.type!=ClientConfigType.webhook){
            throw new Exception(ExceptionType.Client_InvalidCall, "Client type is not webhook", 500);
        }

        const clientConnectionConfig=getConfig().client.connection as WebhookClientConfigDataType;
        const response=await axios.post(clientConnectionConfig.url, data);
    } catch (error) {
        if (error instanceof Exception) {
            throw error;
        }

        throw new Exception(ExceptionType.Client_CallbackFailed, "Callback to client failed.", 500, error);
    }
}

export async function responseCallback(data: any){
    try {
        const callbackData=responseCallbackSchema.parse(data);
        await makeClientCallback(callbackData);
    } catch (error) {
        if (error instanceof Exception) {
            throw error;
        }

        throw new Exception(ExceptionType.Client_CallbackFailed, "Callback to client failed.", 500, error);
    }
}

export async function requestCallback(data: any){
    try {
        const callbackData=requestCallbackSchema.parse(data);
        await makeClientCallback(callbackData);
    } catch (error) {
        if (error instanceof Exception) {
            throw error;
        }

        throw new Exception(ExceptionType.Client_CallbackFailed, "Callback to client failed.", 500, error);
    }
}

export async function errorCallback(data: BecknErrorDataType){
    try {
        await makeClientCallback(data);
    } catch (error) {
        if (error instanceof Exception) {
            throw error;
        }

        throw new Exception(ExceptionType.Client_CallbackFailed, "Callback to client failed.", 500, error);
    }
}