import { z } from "zod";
import { RequestActions, ResponseActions } from "./configs/actions.app.config.schema";

export const becknContextSchema = z.object({
    "domain": z.string(),
    //updated schema to reflect the changes in ver 1.0.0
    "location": z.object(
        {
            "id": z.string().optional(),
            "map_url": z.string().optional(),
            "gps" : z.string().optional(),
            "address": z.string().optional(),
            "city": z.object({"name":z.string(), "code":z.string()}).optional(),
            "district": z.string().optional(),
            "state": z.object({"name":z.string(), "code":z.string()}).optional(),
            "country": z.object({"name":z.string(), "code":z.string()}).optional(),
            "area_code": z.string().optional(),
        }).optional(),
    "version": z.string(),
    "bpp_id": z.string().optional(),
    "bpp_uri": z.string().optional(),
    "transaction_id": z.string(),
    "message_id": z.string(),
    "ttl": z.string(),
    "timestamp": z.string().default(new Date().toISOString()),
    "bap_id": z.string(),
    "bap_uri": z.string(),
    "action": z.union([
        z.nativeEnum(RequestActions), 
        z.nativeEnum(ResponseActions)
    ])
});

export type BecknContextDataType = z.infer<typeof becknContextSchema>;