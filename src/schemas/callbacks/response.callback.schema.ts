import { z } from "zod";
import { becknErrorSchema } from "../becknError.schema";

export const responseCallbackSchema = z.object({
  context: z.any(),
  message: z.any(),
  error: becknErrorSchema.optional()
});

export type ResponseCallbackDataType = z.infer<typeof responseCallbackSchema>;
