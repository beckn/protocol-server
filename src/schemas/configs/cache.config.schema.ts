import moment from "moment";
import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export const cacheConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    ttl: z.string().transform((value) => {
        const duration = moment.duration(value);
        return duration.asMilliseconds();
    }),
    db: z.number().default(0),
});

export type CacheConfigDataType = z.infer<typeof cacheConfigSchema>;

export const parseCacheConfig = (config: any): CacheConfigDataType => {
    if(!config){
        throw new Exception(ExceptionType.Config_CacheConfig_NotFound, "Cache config not found", 404);
    }

    try {
        const cacheConfig= cacheConfigSchema.parse(config);
        return cacheConfig;
    } catch (error) {
        throw new Exception(ExceptionType.Config_CacheConfig_Invalid, "Invalid cache config", 400, error);
    }
}