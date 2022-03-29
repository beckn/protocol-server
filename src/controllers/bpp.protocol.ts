import { NextFunction, Request, Response } from "express";
import { createAuthHeaderConfig } from "../utils/auth";
import { callNetwork } from "../utils/becknRequester";
import { failureCallback, successCallback } from "../utils/callbacks";
import { registryLookup } from "../utils/lookup";
import { triggerHandler } from "./bap.trigger";

export async function bppProtocolHandler(req: Request, res: Response, next : NextFunction) {
    try {
        successCallback(req.body);
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

export async function publishResults(req : Request, res : Response, next : NextFunction) {
    try {
        const context=req.body.context;
        const requestBody=req.body;
        
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
        
        const axios_config=await createAuthHeaderConfig(requestBody)

        let response = await callNetwork([{
            subscriber_id: req.body.context.bap_id,
            subscriber_url: req.body.context.bap_uri,
            type: 'BAP',
            signing_public_key: ''
        }], requestBody, axios_config);

        if(response.status === 200 || response.status === 202 || response.status === 206){
            return;
        } else {
            await failureCallback({
                context: context,
                message: {
                    ack: {
                        status: "NACK",
                    }
                }
            });
        }
    } catch (error) {
        next(error)
    }
}