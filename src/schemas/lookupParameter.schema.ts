import { z } from "zod";

export const lookupParameterSchema = z.object({
    subscriber_id: z.string().optional().nullable(),
    unique_key_id: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    domain: z.string().optional().nullable(),
})

export type LookupParameter = z.TypeOf<typeof lookupParameterSchema>;