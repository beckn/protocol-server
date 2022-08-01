// Create client config schema with config type.
// Create a parser function which will decide the client config type.
// Follow the priority order.

import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export enum ClientConfigType {
    synchronous = "synchronous",
    webhook = "webhook",
    messageQueue = "messageQueue",
}

const syncrhonousClientConfigSchema = z.object({
    mongoURL: z.string(),
});
export type SyncrhonousClientConfigDataType = z.infer<typeof syncrhonousClientConfigSchema>;
export const parseSynchronousClientConfig = (config: any): SyncrhonousClientConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_SynchronousClientConfig_NotFound, "Synchronous client config not found", 404);
    }

    try {
        return syncrhonousClientConfigSchema.parse(config);
    }
    catch (e) {
        throw new Exception(ExceptionType.Config_SynchronousClientConfig_Invalid, "Invalid synchronous client config", 400, e);
    }
}

const webhookClientSchema = z.object({
    url: z.string(),
});
export type WebhookClientConfigDataType = z.infer<typeof webhookClientSchema>;

export const parseWebhookClientConfig = (config: any): WebhookClientConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_WebhookClientConfig_NotFound, "Webhook client config not found", 404);
    }

    try {
        return webhookClientSchema.parse(config);
    }
    catch (e) {
        throw new Exception(ExceptionType.Config_WebhookClientConfig_Invalid, "Invalid webhook client config", 400, e);
    }
}

const messageQueueClientSchema = z.object({
    amqpURL: z.string(),
    incomingQueue: z.string(),
    outgoingQueue: z.string(),
});

export type MessageQueueClientConfigDataType = z.infer<typeof messageQueueClientSchema>;

export const parseMessageQueueClientConfig = (config: any): MessageQueueClientConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_MessageQueueClientConfig_NotFound, "Message queue client config not found", 404);
    }

    try {
        return messageQueueClientSchema.parse(config);
    }
    catch (e) {
        throw new Exception(ExceptionType.Config_MessageQueueClientConfig_Invalid, "Invalid message queue client config", 400, e);
    }
}

export const clientConfigSchema = z.object({
    type: z.nativeEnum(ClientConfigType),
    connection: z.union([
        syncrhonousClientConfigSchema,
        webhookClientSchema,
        messageQueueClientSchema,
    ]),
});

export type ClientConfigDataType = z.infer<typeof clientConfigSchema>;

export const parseClientConfig = (config: any): ClientConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_ClientConfig_NotFound, "Client config not found", 404);
    }

    if(Object.keys(config).length === 0){
        throw new Exception(ExceptionType.Config_ClientConfig_Invalid, "Not even one type of Client Configuration is found.", 400);
    }

    if(Object.keys(config).length>1){
        throw new Exception(ExceptionType.Config_ClientConfig_Invalid, "More than one type of Client Configuration found.", 400);
    }

    if(config['synchronous']){
        return {
            type: ClientConfigType.synchronous,
            connection: parseSynchronousClientConfig(config['synchronous']),
        }
    }
    else if(config['webhook']){
        return {
            type: ClientConfigType.webhook,
            connection: parseWebhookClientConfig(config['webhook']),
        }
    }
    else if(config['messageQueue']){
        return {
            type: ClientConfigType.messageQueue,
            connection: parseMessageQueueClientConfig(config['messageQueue']),
        }
    }
    else{
        throw new Exception(ExceptionType.Config_ClientConfig_Invalid, "Invalid client config", 400);
    }
}