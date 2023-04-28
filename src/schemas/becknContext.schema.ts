import { z } from "zod";
 import { RequestActions, ResponseActions } from "./configs/actions.app.config.schema";

 export const becknContextSchema = z.object({
     "domain": z.string(),
     "country": z.string(),
     "city": z.string(),
     "core_version": z.string(),
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