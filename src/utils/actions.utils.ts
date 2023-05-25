import { z } from "zod";
import { RequestActions, ResponseActions } from "../schemas/configs/actions.app.config.schema";

export class ActionUtils{
    public static getCorrespondingResponseAction(action: RequestActions): ResponseActions{
        switch (action) {
            case RequestActions.cancel:
                return ResponseActions.on_cancel;
            case RequestActions.confirm:
                return ResponseActions.on_confirm;
            case RequestActions.init:
                return ResponseActions.on_init;
            case RequestActions.rating:
                return ResponseActions.on_rating;
            case RequestActions.search:
                return ResponseActions.on_search;
            case RequestActions.select:
                return ResponseActions.on_select;
            case RequestActions.status:
                return ResponseActions.on_status;
            case RequestActions.support: 
                return ResponseActions.on_support;
            case RequestActions.track: 
                return ResponseActions.on_track;
            case RequestActions.update:
                return ResponseActions.on_update;
            case RequestActions.get_cancellation_reasons:
                return ResponseActions.cancellation_reasons;
            case RequestActions.get_rating_categories:
                return ResponseActions.rating_categories;
        }
    }

    public static getCorrespondingRequestAction(action: ResponseActions): RequestActions{
        switch (action) {
            case ResponseActions.on_cancel:
                return RequestActions.cancel;
            case ResponseActions.on_confirm:
                return RequestActions.confirm;
            case ResponseActions.on_init:
                return RequestActions.init;
            case ResponseActions.on_rating:
                return RequestActions.rating;
            case ResponseActions.on_search:
                return RequestActions.search;
            case ResponseActions.on_select:
                return RequestActions.select;
            case ResponseActions.on_status:
                return RequestActions.status;
            case ResponseActions.on_support: 
                return RequestActions.support;
            case ResponseActions.on_track: 
                return RequestActions.track;
            case ResponseActions.on_update:
                return RequestActions.update;
            case ResponseActions.cancellation_reasons:
                return RequestActions.get_cancellation_reasons;
            case ResponseActions.rating_categories:
                return RequestActions.get_rating_categories;
        }
    }

    public static parseAction(action: string): RequestActions | ResponseActions{
        const actionSchema=z.union([
            z.nativeEnum(RequestActions),
            z.nativeEnum(ResponseActions)
        ]);

        return actionSchema.parse(action);
    }
}
