import { z } from 'zod'

export enum NetworkPaticipantType {
    BAP = "BAP",
    BPP = "BPP",
    BG = "BG",
    BREG = "BREG",
}

export const subscriberDetailsSchema = z.object({
    "subscriber_id": z.string(),
    "subscriber_url": z.string(),
    "type": z.nativeEnum(NetworkPaticipantType),
    "signing_public_key": z.string(),
    "valid_until": z.string(),
});

export type SubscriberDetail = z.TypeOf<typeof subscriberDetailsSchema>;