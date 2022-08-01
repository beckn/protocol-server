// Create response cache config schema.
// Create parser function for the same.
// In case enabled true then it should have mongoURL and ttl.

import moment from "moment";
import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export const responseCacheConfigSchema = z.object({
    enabled: z.boolean(),
    mongoURL: z.string().optional(),
    ttl: z.string().transform((value) => {
        const duration = moment.duration(value);
        return duration.asMilliseconds();
    }).optional(),
});

export type ResponseCacheConfigDataType = z.infer<typeof responseCacheConfigSchema>;

export const parseResponseCacheConfig = (config: any): ResponseCacheConfigDataType => {
    if(!config){
        return {
            enabled: false,
        }
    }

    if(!config.mongoURL){
        throw new Exception(ExceptionType.Config_ResponseCacheConfig_Invalid, "Response cache configuration is invalid, mongoURL is required.", 400);
    }
    if(!config.ttl){
        throw new Exception(ExceptionType.Config_ResponseCacheConfig_Invalid, "Response cache configuration is invalid, ttl is required.", 400);
    }

    const responseCacheConfig = responseCacheConfigSchema.parse({
        enabled: true,
        mongoURL: config.mongoURL,
        ttl: config.ttl,
    });
    return responseCacheConfig;
}