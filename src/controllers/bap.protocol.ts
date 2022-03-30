import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { ResponseCache } from "../models/response.cache";
import { successCallback } from "../utils/callbacks";

const responseCache=ResponseCache.getInstance();
export async function bapProtocolHandler(req: Request, res: Response, next : NextFunction) {
    try {
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });

        if(process.env.action=='search'){
            responseCache.cacheResponse(req.body);
        }
        successCallback(req.body);
    } catch (error) {
        next(error)
    }
}