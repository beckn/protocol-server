import { Request, Response, NextFunction } from "express"
import { Locals } from "../interfaces/locals.interface";
import { RequestActions, ResponseActions } from "../schemas/configs/actions.app.config.schema";
import logger from "../utils/logger.utils";
import * as AmqbLib from "amqplib";
import { Exception, ExceptionType } from "../models/exception.model";
import { GatewayUtils } from "../utils/gateway.utils";
import { RequestCache } from "../utils/cache/request.cache.utils";
import { errorCallback } from "../utils/callback.utils";
import { BecknErrorType } from "../schemas/becknError.schema";
import { NetworkPaticipantType, SubscriberDetail } from "../schemas/subscriberDetails.schema";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { callNetwork } from "../utils/becknRequester.utils";
import { createAuthHeaderConfig } from "../utils/auth.utils";
import { getConfig } from "../utils/config.utils";
import { ClientConfigType } from "../schemas/configs/client.config.schema";

export const bppClientResponseHandler = async (req: Request, res: Response<{}, Locals>, next: NextFunction, action: ResponseActions) => {
    try {
        await GatewayUtils.getInstance().sendToNetworkSideGateway(req.body);
    } catch (err) {
        if(err instanceof Exception){
            throw err;
        }

        throw new Exception(ExceptionType.Request_Failed, "BPP Response Failed", 400, err);
    }
}

export const bppClientResponseSettler = async (msg: AmqbLib.ConsumeMessage | null) => {
    try {
        const responseBody=JSON.parse(msg?.content.toString()!);
        const message_id=responseBody.context.message_id;
        const action=responseBody.context.action as RequestActions;
        const bap_uri=responseBody.context.bap_uri;

        const requestCache=await RequestCache.getInstance().check(message_id, action);
        if(!requestCache){
            errorCallback({
                // TODO: change this error code.
                code: 651641,
                type: BecknErrorType.coreError,
                message: "Request timed out",
            });
            return;
        }

        const axios_config = await createAuthHeaderConfig(responseBody);
        
        let response:BecknResponse|null=null;
        if(requestCache.sender.type==NetworkPaticipantType.BG){
            const subscribers=[
                requestCache.sender,
            ];

            response=await callNetwork(subscribers, responseBody, axios_config, action);
        }
        else{
            const subscribers:Array<SubscriberDetail>=[
                {
                    ...requestCache.sender,
                    subscriber_url: bap_uri,
                },
            ];

            response=await callNetwork(subscribers, responseBody, axios_config, action);
        }

        if((response.status==200)||(response.status==202)||(response.status==206)){
            // Network Calls Succeeded.
            return;
        }

        switch(getConfig().client.type){
            case ClientConfigType.synchronous:{
                throw new Exception(ExceptionType.Config_ClientConfig_Invalid, "Synchronous mode is not available for BPP.", 400);
                break;
            }
            case ClientConfigType.messageQueue:{
                // TODO: implement message queue.
                break;
            }
            case ClientConfigType.webhook:{
                errorCallback({
                    // TODO: change the error code.
                    code: 354845,
                    message: "Network call failed",
                    type: BecknErrorType.coreError,
                    data: [response],
                });
                break;
            }
        }
    } catch (error) {
        logger.error(error)
    }
}