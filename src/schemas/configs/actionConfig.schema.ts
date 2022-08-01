import moment from "moment";
import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";

export const actionConfigSchema = z.object({
    ttl: z.string().transform((value) => {
        const duration = moment.duration(value);
        return duration.asMilliseconds();
    }).default("PT10S")
});

export type ActionConfigDataType = z.infer<typeof actionConfigSchema>;

export const parseActionConfig = (config: any): ActionConfigDataType => {
    if(!config){
        return {
            ttl: 10000,
        }
    }

    try {
        const actionConfig = actionConfigSchema.parse(config);
        return actionConfig;
    } catch (error) {
        throw new Exception(ExceptionType.Config_ActionConfig_Invalid, "Invalid action config", 400, error);
    }
}
