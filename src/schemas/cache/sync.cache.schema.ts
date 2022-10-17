import { z } from "zod";
import { becknErrorSchema } from "../becknError.schema";
import { RequestActions } from "../configs/actions.app.config.schema";

export const syncCacheSchema = z.object({
    message_id: z.string(),
    action: z.nativeEnum(RequestActions),
    responses: z.array(z.any()),
    error: becknErrorSchema.optional()
}); 

export type SyncCacheDataType = z.infer<typeof syncCacheSchema>;
