import {v4 as uuid_v4} from 'uuid';
import { string } from 'zod';

export function buildContext (context: any, action: string)  {
    const timestamp = new Date().toISOString();
    const message_id=uuid_v4();
    const transaction_id=(context.transaction_id)?context.transaction_id:uuid_v4();
    
    const bapContext={
        ...context,
        action: string,
        message_id: message_id,
        transaction_id,
        country: process.env.country,
        bap_id: process.env.subscriberId,
        bap_uri: process.env.subscriberUri,
        city: process.env.city,
        timestamp: timestamp,
        ttl: process.env.ttl
    }
    
    return bapContext;
}