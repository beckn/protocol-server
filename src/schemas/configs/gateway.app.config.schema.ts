import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export enum GatewayMode {
    client = "client",
    network = "network",
}

export const gatewayAppConfigSchema =z.object({
    mode: z.nativeEnum(GatewayMode),
    inboxQueue: z.string(),
    outboxQueue: z.string(),
    amqpURL: z.string(),
});

export type GatewayAppConfigDataType = z.infer<typeof gatewayAppConfigSchema>;

export const parseGatewayAppConfig = (config: any): GatewayAppConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_GatewayAppConfig_NotFound, "Gateway app config not found", 404);
    }

    try {
        return gatewayAppConfigSchema.parse(config);
    }
    catch (e) {
        throw new Exception(ExceptionType.Config_GatewayAppConfig_Invalid, "Invalid gateway app config", 400, e);
    }
}