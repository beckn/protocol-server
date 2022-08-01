import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";

export async function testController(req: Request, res: Response<{}, Locals>, next: NextFunction) {
    
    // // Request Cache Code.
    // const requestCache=RequestCache.getInstance();
    // const oldRequest=await requestCache.check(req.body.context.message_id, req.body.context.action);
    // console.log(oldRequest)
    // const requestData=parseRequestCache(
    //     req.body.context.transaction_id, 
    //     req.body.context.message_id, 
    //     req.body.context.action,
    //     res.locals.sender!, 
    //     undefined
    // );
    // const cacheResult=await requestCache.cache(requestData, getConfig().app.actions.requests.init!.ttl);
    // console.log(cacheResult);
    // // Request Cache Code End.

    res.status(200).json({
        message: {
            ack: {
                status: "ACK"
            }
        }
    });
}