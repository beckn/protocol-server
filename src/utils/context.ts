import {v4 as uuid_v4} from 'uuid';

export function buildContext (context: any)  {
    const timestamp = new Date().toISOString();
    const message_id=uuid_v4();
    const transaction_id=(context.transaction_id)?context.transaction_id:uuid_v4();
    
    const bapContext={
        ...context,
        message_id: message_id,
        transaction_id,
        country: process.env.country,
        bap_id: process.env.protocolId,
        bap_uri: process.env.protocolUri,
        city: process.env.city,
        timestamp: timestamp,
        ttl: process.env.ttl
    }
    
    return bapContext;
}