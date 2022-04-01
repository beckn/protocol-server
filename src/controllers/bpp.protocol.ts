import { NextFunction, Request, Response } from "express";
import { createAuthHeaderConfig } from "../utils/auth";
import { callNetwork } from "../utils/becknRequester";
import { clientCallback } from "../utils/callbacks";

export async function bppProtocolHandler(req: Request, res: Response, next : NextFunction, action: string) {
    try {
        clientCallback(req.body, false);
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
    } catch (error) {
        next(error)
    }
}

export async function publishResults(req : Request, res : Response, next : NextFunction, action: string) {
    try {
        const context=req.body.context;
        context.bpp_id=process.env.subscriberId;
        context.bpp_uri=process.env.subscriberUri;
        context.ttl=process.env.ttl;

        const requestBody=req.body;
        
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
        
        const axios_config=await createAuthHeaderConfig(requestBody)

        // TODO: Make calls to the BAP or BG.
        let response = await callNetwork([{
            subscriber_id: req.body.context.bap_id,
            subscriber_url: req.body.context.bap_uri,
            type: 'BAP',
            signing_public_key: '',
            valid_until: (new Date()).toISOString()
        }], {
            context: context,
            message: requestBody.message,
            error: requestBody.error
        }, axios_config, action);

        if(response.status === 200 || response.status === 202 || response.status === 206){
            return;
        } else {
            await clientCallback({
                context: context,
                message: {
                    ack: {
                        status: "NACK",
                    }
                },
                error: {
                    message: 'Error publishing results to BAP.'
                }
            }, true);
        }
    } catch (error) {
        next(error)
    }
}