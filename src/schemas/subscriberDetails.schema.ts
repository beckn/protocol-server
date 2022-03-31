import { z } from 'zod'

export const subscriberDetailsSchema = z.object({
    "subscriber_id": z.string(),
    "subscriber_url": z.string(),
    "type": z.string(),
    "signing_public_key": z.string(),
    "valid_until": z.string(),
});

export type SubscriberDetail = z.TypeOf<typeof subscriberDetailsSchema>;