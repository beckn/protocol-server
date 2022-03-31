import { NextFunction, Request, Response } from "express";

export async function unConfigureActionHandler(req: Request, res: Response, next: NextFunction, action: string) {
    res.status(500).json({
        error: `Action ${action} is not configured.`,
    });
    return;
}