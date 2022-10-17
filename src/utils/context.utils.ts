import moment from 'moment';
import { v4 as uuid_v4 } from 'uuid';
import { Exception, ExceptionType } from '../models/exception.model';
import { BecknContextDataType } from '../schemas/becknContext.schema';
import { AppMode } from '../schemas/configs/app.config.schema';
import { ActionUtils } from './actions.utils';
import { getConfig } from './config.utils';

export const bapContextBuilder = (context: any, action: string)  : BecknContextDataType => {
    if (!context) {
        throw new Exception(ExceptionType.Context_NotFound, "Context not found", 404);
    }
    if (!context.domain) {
        throw new Exception(ExceptionType.Context_DomainNotFound, "Domain not found in the context", 404);
    }
    if(!context.core_version){
        throw new Exception(ExceptionType.Context_CoreVersionNotFound, "Core version not found in the context", 404);
    }

    let transaction_id=(context.transaction_id)?context.transaction_id:uuid_v4();
    const message_id=uuid_v4();
    const bapContext : BecknContextDataType={
        domain: context.domain,
        core_version: context.core_version,
        action: ActionUtils.parseAction(context.action),
        
        bap_id: (context.bap_id) ? context.bap_id : getConfig().app.subscriberId,
        bap_uri: (context.bap_uri) ? context.bap_uri : getConfig().app.subscriberUri,
        country: (context.country) ? context.country : getConfig().app.country,
        city: (context.city) ? context.city : getConfig().app.city,
        
        bpp_id: context.bpp_id,
        bpp_uri: context.bpp_uri,

        transaction_id: transaction_id,
        message_id: message_id,
        
        ttl: moment.duration(getConfig().app.ttl, 'ms').toISOString(),
        timestamp: new Date().toISOString(),
    };

    return bapContext;
}

export const bppContextBuilder = (context: any, action: string)  : BecknContextDataType => {
    if (!context) {
        throw new Exception(ExceptionType.Context_NotFound, "Context not found", 404);
    }
    if (!context.domain) {
        throw new Exception(ExceptionType.Context_DomainNotFound, "Domain not found in the context", 404);
    }
    if(!context.core_version){
        throw new Exception(ExceptionType.Context_CoreVersionNotFound, "Core version not found in the context", 404);
    }
    if(!context.transaction_id){
        throw new Exception(ExceptionType.Context_TransactionIdNotFound, "transaction_id not found in the context", 404);
    }
    if(!context.message_id){
        throw new Exception(ExceptionType.Context_MessageIdNotFound, "message_id not found in the context", 404);
    }

    const bppContext : BecknContextDataType={
        domain: context.domain,
        core_version: context.core_version,
        action: ActionUtils.parseAction(context.action),
        
        bpp_id: (context.bpp_id) ? context.bpp_id : getConfig().app.subscriberId,
        bpp_uri: (context.bpp_uri) ? context.bpp_uri : getConfig().app.subscriberUri,
        country: (context.country) ? context.country : getConfig().app.country,
        city: (context.city) ? context.city : getConfig().app.city,
        
        bap_id: context.bap_id,
        bap_uri: context.bap_uri,

        transaction_id: context.transaction_id,
        message_id: context.message_id,
        
        ttl: moment.duration(getConfig().app.ttl, 'ms').toISOString(),
        timestamp: new Date().toISOString(),
    };

    return bppContext;
}