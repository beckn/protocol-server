import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export const serverConfigSchema= z.object({
    port: z.number(),
});

export type ServerConfigDataType = z.infer<typeof serverConfigSchema>;

export const parseServerConfig = (config: any): ServerConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_ServerConfig_NotFound, "Server config not found", 404);
    }

    try {
        return serverConfigSchema.parse(config);
    }
    catch (e) {
        throw new Exception(ExceptionType.Config_ServerConfig_Invalid, "Invalid server config", 400, e);
    }
}
