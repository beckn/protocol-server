import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { clientCallback } from "../utils/callbacks";
import { ResponseCache } from "../utils/response.cache";


const responseCache=ResponseCache.getInstance();
export async function bapProtocolHandler(req: Request, res: Response, next : NextFunction, action: string) {
    try {
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
    } catch (error) {
        next(error);
    }

    try {
        if(action=='search'){
            responseCache.cacheResponse(req.body);
        }
        clientCallback(req.body, false);
    } catch (error:any) {
        await clientCallback({
            context: req.body.context,
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