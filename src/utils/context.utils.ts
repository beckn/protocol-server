import { v4 as uuid_v4 } from 'uuid';
import { Exception, ExceptionType } from '../models/exception.model';
import { getConfig } from './config.utils';

export function buildContext(context: any, action: string) {
    const timestamp = new Date().toISOString();
    const message_id = uuid_v4();
    const transaction_id = (context.transaction_id) ? context.transaction_id : uuid_v4();

    if (!context) {
        throw new Exception(ExceptionType.Context_NotFound, "Context not found", 404);
    }

    if (!context.domain) {
        throw new Exception(ExceptionType.Context_DomainNotFound, "Domain not found in the context", 404);
    }

    const bapContext = {
        domain: context.domain,
        country: (context.country) ? context.country : getConfig().app.country,
        city: (context.city) ? context.city : getConfig().app.city,
        core_version: context.core_version,
        useCache: (context.useCache==true),

        ...context,
        
        transaction_id: transaction_id,
        message_id: message_id,
        ttl: getConfig().app.ttl,
        timestamp: timestamp,
        bap_id: getConfig().app.subscriberId,
        bap_uri: getConfig().app.subscriberUri,
        action: action,
    }

    return bapContext;
}