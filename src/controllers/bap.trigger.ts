import { NextFunction, Request, Response } from "express";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { createAuthHeaderConfig } from "../utils/auth";
import { makeBecknRequest, callNetwork } from "../utils/becknRequester";
import { failureCallback } from "../utils/callbacks";
import { buildContext } from "../utils/context";
import { registryLookup } from "../utils/lookup";

export async function triggerHandler(req: Request, res: Response, next: NextFunction) {
    try {

        const context=req.body.context;
        const requestBody=req.body;
        
        const bpp_id: string | undefined=context.bpp_id;
        const bpp_uri: string | undefined=context.bpp_uri;

        if((process.env.action!='search')&&((!bpp_id)||(!bpp_uri)||(bpp_id=='')||(bpp_uri==''))){
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
            
            response=await callNetwork(subscribers, requestBody, axios_config);
        }
        else{
            const subscribers=await registryLookup({
                type: 'BG',
                domain: requestBody.context.domain
            });
            
            response=await callNetwork(subscribers, requestBody, axios_config);
        }

        if((response.status==200)||(response.status==202)||(response.status==206)){
            // Network Calls Succeeded.
            return;
        }

        // Network Calls Failed.
        await failureCallback({
            context,
            message: {
                ack: {
                    status: "NACK",
                },
            },
            error: { 
                message: response.data   
            }
        });

    } catch (error) {
        next(error);
    }
}