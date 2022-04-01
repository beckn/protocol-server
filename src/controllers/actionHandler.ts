import { NextFunction, Request, Response } from "express";

export async function unConfigureActionHandler(req: Request, res: Response, next: NextFunction, action: string) {
    // TODO: create proper error body.
    res.status(500).json({
        error: `Action ${action} is not configured.`,
    });
    return;
}