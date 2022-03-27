import { NextFunction, Request, Response } from "express";
import { createAuthHeaderConfig } from "../utils/auth";
import { callNetwork } from "../utils/becknRequester";
import { failureCallback, successCallback } from "../utils/callbacks";
import { registryLookup } from "../utils/lookup";
import { triggerHandler } from "./trigger";

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
        const axios_config=await createAuthHeaderConfig(requestBody)
        const subscribers=await registryLookup({
                type: 'BG',
                domain: requestBody.context.domain
            });
        let response = await callNetwork(subscribers, requestBody, axios_config);
        if(response.status === 200 || response.status === 202 || response.status === 206){
            return;
        } else {
            await failureCallback({
                context: context,
                message: {
                    ack: {
                        status: "ACK",
                    }
                }
            });
        }
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