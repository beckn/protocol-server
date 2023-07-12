import { NextFunction, Request, Response } from "express"
import { Locals } from "../interfaces/locals.interface"
import { ResponseActions } from "../schemas/configs/actions.app.config.schema"
import logger from "../utils/logger.utils"
import * as AmqbLib from "amqplib";
import { Exception, ExceptionType } from "../models/exception.model";
import { ActionUtils } from "../utils/actions.utils";
import { RequestCache } from "../utils/cache/request.cache.utils";
import { acknowledgeACK, acknowledgeNACK } from "../utils/acknowledgement.utils";
import { BecknErrorType } from "../schemas/becknError.schema";
import { GatewayUtils } from "../utils/gateway.utils";
import { getConfig } from "../utils/config.utils";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { SyncCache } from "../utils/cache/sync.cache.utils";
import { responseCallback } from "../utils/callback.utils";

export const bapNetworkResponseHandler = async (req: Request, res: Response<{}, Locals>, next: NextFunction, action: ResponseActions) => {
    try {
        const requestAction=ActionUtils.getCorrespondingRequestAction(action);
        const message_id=req.body.context.message_id;

        const requestCache=await RequestCache.getInstance().check(message_id, requestAction);
        if(!requestCache){
            acknowledgeNACK(res, req.body.context, {
                // TODO: change the error code.
                code: 6781616,
                message: "Response timed out",
                type: BecknErrorType.coreError, 
            });
            return;
        }

        logger.info(`sending ack to bpp`);
        logger.info(`request to bpp ${JSON.stringify(req.body.context)}`);
        acknowledgeACK(res, req.body.context);

        logger.info(`sending response to inbox queue`);
        logger.info(`response: ${JSON.stringify(req.body)}`);
        
        await GatewayUtils.getInstance().sendToClientSideGateway(req.body);

    } catch (err) {
        let exception: Exception|null=null;
        if(err instanceof Exception){
            exception=err;
        }
        else{
            exception=new Exception(ExceptionType.Response_Failed, "BAP Response Failed at bapNetworkResponseHandler", 500, err);
        }

        logger.error(exception);
    }
}

export const bapNetworkResponseSettler = async (message: AmqbLib.ConsumeMessage | null) => {
    try {
        
        logger.info('Protocol Client Server (Network Settler) recieving message from inbox queue');
        
        const responseBody=JSON.parse(message?.content.toString()!)

        logger.info(`message: ${JSON.stringify(responseBody)}`);

        const message_id=responseBody.context.message_id;
        const action=ActionUtils.getCorrespondingRequestAction(responseBody.context.action);
        switch(getConfig().client.type){
            case  ClientConfigType.synchronous:{
                await SyncCache.getInstance().insertResponse(message_id, action, responseBody);
                break;
            }
            case  ClientConfigType.webhook:{
                console.log("S")
		responseCallback(responseBody);
                break;
            }
            case  ClientConfigType.messageQueue:{
                // TODO: implement message queue
                break;
            }
        }
    }
    catch (err) {
        let exception: Exception|null=null;
        if(err instanceof Exception){
            exception=err;
        }
        else{
            exception=new Exception(ExceptionType.Response_Failed, "BAP Response Failed at bapNetworkResponseSettler", 500, err);
        }
        
        logger.error(err)    
    }
}
