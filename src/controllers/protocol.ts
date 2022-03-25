import { NextFunction, Request, RequestHandler, Response } from "express";
import { publishToApiQueue } from "../utils/mq";

export const protocolHandler : RequestHandler = async (req : Request, res : Response, next : NextFunction ) => {
    try {
        const data = req.body
        await publishToApiQueue(data)
        res.status(200).json({
            message: {
                ack: {
                    status: "ACK"
                }
            }
        })
    } catch (error) {
        next(error);
    }
}