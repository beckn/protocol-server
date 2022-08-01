import { z } from "zod";

export const becknResponseSchema=z.object({
    status: z.number({
        required_error: "Status is required..."
    }),
    data: z.string({
        required_error:"Response Data is required..."
    })
})

export type BecknResponse= z.TypeOf<typeof becknResponseSchema>;