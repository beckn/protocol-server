import { z } from "zod";

export const requestCallbackSchema = z.object({
    context: z.object({}),
    message: z.object({}),
});

export type RequestCallbackDataType = z.infer<typeof requestCallbackSchema>;