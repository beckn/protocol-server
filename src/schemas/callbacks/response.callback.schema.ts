import { z } from "zod";

export const responseCallbackSchema = z.object({
    context: z.object({}),
    message: z.object({}),
    error: z.object({}),
});

export type ResponseCallbackDataType = z.infer<typeof responseCallbackSchema>;