import { NextFunction, Request, Response } from "express";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { createAuthHeaderConfig } from "../utils/auth";
import { makeBecknRequest, callNetwork } from "../utils/becknRequester";
import { clientCallback } from "../utils/callbacks";
import { ActionTypes } from "../utils/config";
import { buildContext } from "../utils/context";
import logger from "../utils/logger";
import { registryLookup } from "../utils/lookup";
import { ResponseCache } from "../utils/response.cache";

const responseCache=ResponseCache.getInstance();

export async function triggerHandler(req: Request, res: Response, next: NextFunction, action: string) {
    const context=req.body.context;
    const requestBody=req.body;
    
    const bpp_id: string | undefined=context.bpp_id;
    const bpp_uri: string | undefined=context.bpp_uri;
    try {

        if((action!=ActionTypes.search)&&((!bpp_id)||(!bpp_uri)||(bpp_id=='')||(bpp_uri==''))){
            res.status(400).json({
                context: context,
                message: {
                    ack: {
                        status: "NACK",
                    }
                },
                error: {
                    message: 'All triggers other than searchs requires bpp_id and bpp_uri. \nMissing bpp_id or bpp_uri'
                }
            });    
            return;
        }

        res.status(202).json({
            context: context,
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
    } catch (error) {
        next(error);
    }

    // Asynchronous Block.
    try {
        if(action==ActionTypes.search){
            if(requestBody.context.useCache){
                const cachedResponses=await responseCache.check(requestBody);
                if(cachedResponses){
                    cachedResponses.forEach(async (responseData)=>{
                        responseData.context.message_id=context.message_id;
                        responseData.context.transaction_id=context.transaction_id;
                        await clientCallback(responseData, false);
                    });
                }   
                else{
                    await clientCallback({
                        context: context,
                        message: {
                            ack: {
                                status: "NACK",
                            },
                        },
                        error: { 
                            message: 'No cached responses found'   
                        } 
                    }, true);
                } 
                return;
            }

            await responseCache.cacheRequest(requestBody);
        }

        delete requestBody.context.useCache;

        // Auth Creation.
        const axios_config=await createAuthHeaderConfig(requestBody)
        
        let response: BecknResponse|undefined;

        // In case bpp_id and bpp_uri is present.
        if((bpp_id && bpp_uri) && (bpp_id!=='' && bpp_uri!=='')){
            
            const subscribers=await registryLookup({
                type: 'BPP',
                domain: requestBody.context.domain,
                subscriber_id: bpp_id
            });

            for(let i=0; i<subscribers.length; i++){
                subscribers[i].subscriber_url=bpp_uri;
            }
            
            response=await callNetwork(subscribers, requestBody, axios_config, action);
        }
        else{
            const subscribers=await registryLookup({
                type: 'BG',
                domain: requestBody.context.domain
            });
            
            response=await callNetwork(subscribers, requestBody, axios_config, action);
        }

        if((response.status==200)||(response.status==202)||(response.status==206)){
            // Network Calls Succeeded.
            return;
        }

        // Network Calls Failed.
        await clientCallback({
            context,
            message: {
                ack: {
                    status: "NACK",
                },
            },
            error: { 
                message: response.data   
            }
        }, true);
    } catch (error:any) {
        logger.error(error);
        await clientCallback({
            context,
            message: {
                ack: {
                    status: "NACK",
                },
            },
            error: { 
                message: error.toString()   
            }
        }, true);
    }
}