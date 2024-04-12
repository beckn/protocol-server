import { z } from "zod";
import { RequestActions, RequestType } from "../configs/actions.app.config.schema";
import { SubscriberDetail, subscriberDetailsSchema } from "../subscriberDetails.schema";
import moment from "moment";

export const RequestCacheSchema = z.object({
    transaction_id: z.string(),
    message_id: z.string(),
    action: z.nativeEnum(RequestActions),
    requestType: z.nativeEnum(RequestType),
    sender: subscriberDetailsSchema,
    ttl: z.number().optional(),
    timestamp: z.number().optional()
});

export type RequestCacheDataType = z.infer<typeof RequestCacheSchema>;

// Take sender details from the request object
export const parseRequestCache = (
    transaction_id: string,
    message_id: string,
    action: string,
    sender: SubscriberDetail,
    gatewayHeader?: string,
    ttl?: number
): RequestCacheDataType => {
    return RequestCacheSchema.parse({
        transaction_id: transaction_id,
        message_id: message_id,
        action: action,
        requestType: ((gatewayHeader) && (gatewayHeader != "")) ? RequestType.broadcast : RequestType.direct,
        sender: sender,
        ttl,
        timestamp: moment().valueOf()
    });
}
