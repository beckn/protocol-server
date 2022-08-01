import { NextFunction, Request, Response } from "express";

export async function unConfigureActionHandler(req: Request, res: Response, next: NextFunction, action: string) {
    res.status(500).json({
        context: req.body.context,
        message: {
            ack: {
                status: "NACK",
            },
        },
        error: {
            code: 4001,
            message: `Action ${action} is not configured`
        }
    });
    return;
}