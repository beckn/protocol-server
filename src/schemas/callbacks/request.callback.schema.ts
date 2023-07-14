import { z } from "zod";

export const requestCallbackSchema = z.object({
  context: z.any(),
  message: z.any()
});

export type RequestCallbackDataType = z.infer<typeof requestCallbackSchema>;
