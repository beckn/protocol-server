import { z } from "zod";
// import { becknContextSchema } from "../becknContext.schema";

export const requestCallbackSchema = z.object({
  // context: becknContextSchema,
  context: z.any(),
  message: z.any()
});

export type RequestCallbackDataType = z.infer<typeof requestCallbackSchema>;
