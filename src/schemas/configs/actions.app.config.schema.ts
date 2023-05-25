import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";
import { actionConfigSchema } from "./actionConfig.schema";

export enum RequestActions {
    search = "search",
    select = "select",
    init = "init",
    confirm = "confirm",
    update = "update",
    status = "status",
    track = "track",
    cancel = "cancel",
    rating = "rating",
    support = "support",
    get_cancellation_reasons = "get_cancellation_reasons",
    get_rating_categories = "get_rating_categories"
}

export enum ResponseActions {
    on_search = "on_search",
    on_select = "on_select",
    on_init = "on_init",
    on_confirm = "on_confirm",
    on_update = "on_update",
    on_status = "on_status",
    on_track = "on_track",
    on_cancel = "on_cancel",
    on_rating = "on_rating",
    on_support = "on_support",
    cancellation_reasons = "cancellation_reasons",
    rating_categories = "rating_categories"
}

export enum RequestType {
    broadcast = 'broadcast',
    direct = 'direct',
}

export const actionsAppConfigSchema = z.object({
    requests: z.object({
        [RequestActions.search]: actionConfigSchema.optional(),
        [RequestActions.select]: actionConfigSchema.optional(),
        [RequestActions.init]: actionConfigSchema.optional(),
        [RequestActions.confirm]: actionConfigSchema.optional(),
        [RequestActions.update]: actionConfigSchema.optional(),
        [RequestActions.status]: actionConfigSchema.optional(),
        [RequestActions.track]: actionConfigSchema.optional(),
        [RequestActions.cancel]: actionConfigSchema.optional(),
        [RequestActions.rating]: actionConfigSchema.optional(),
        [RequestActions.support]: actionConfigSchema.optional(),
        [RequestActions.get_cancellation_reasons]: actionConfigSchema.optional(),
        [RequestActions.get_rating_categories]: actionConfigSchema.optional()
    }),

    responses: z.object({
        [ResponseActions.on_search]: actionConfigSchema.optional(),
        [ResponseActions.on_select]: actionConfigSchema.optional(),
        [ResponseActions.on_init]: actionConfigSchema.optional(),
        [ResponseActions.on_confirm]: actionConfigSchema.optional(),
        [ResponseActions.on_update]: actionConfigSchema.optional(),
        [ResponseActions.on_status]: actionConfigSchema.optional(),
        [ResponseActions.on_track]: actionConfigSchema.optional(),
        [ResponseActions.on_cancel]: actionConfigSchema.optional(),
        [ResponseActions.on_rating]: actionConfigSchema.optional(),
        [ResponseActions.on_support]: actionConfigSchema.optional(),
        [ResponseActions.cancellation_reasons]: actionConfigSchema.optional(),
        [ResponseActions.rating_categories]: actionConfigSchema.optional()
    }),
});

export type ActionsAppConfigDataType = z.infer<typeof actionsAppConfigSchema>;

export const parseActionsAppConfig = (config: any): any => {
    if (!config) {
        throw new Exception(ExceptionType.Config_ActionsAppConfig_Invalid, "Actions not found", 404);
    }

    try {
        const actionsAppConfig = actionsAppConfigSchema.parse(config);
        return actionsAppConfig;
    } catch (error) {
        throw new Exception(ExceptionType.Config_ActionsAppConfig_Invalid, "Invalid actions config", 400, error);
    }
}
