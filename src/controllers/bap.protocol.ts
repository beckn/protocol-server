import axios from "axios";
import { NextFunction, Request, Response } from "express";

export async function bapProtocolHandler(req: Request, res: Response, next : NextFunction) {
    try {
        axios.post(process.env.successUrl!, req.body)
        res.status(202).json({
            message: {
                ack: {
                    status: "success",
                }
            }
        })
    } catch (error) {
        next(error)
    }
}