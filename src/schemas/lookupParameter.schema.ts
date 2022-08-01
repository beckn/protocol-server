import { z } from "zod";
import { NetworkPaticipantType } from "./subscriberDetails.schema";

export const lookupParameterSchema = z.object({
    subscriber_id: z.string().optional().nullable(),
    unique_key_id: z.string().optional().nullable(),
    type: z.nativeEnum(NetworkPaticipantType).optional().nullable(),
    domain: z.string().optional().nullable(),
})

export type LookupParameter = z.TypeOf<typeof lookupParameterSchema>;