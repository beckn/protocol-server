import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { successCallback } from "../utils/callbacks";

export async function bapProtocolHandler(req: Request, res: Response, next : NextFunction) {
    try {
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });

        successCallback(req.body);
    } catch (error) {
        next(error)
    }
}