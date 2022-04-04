import { NextFunction, Request, Response } from "express";

export async function jsonConverter(req: Request, res: Response, next: NextFunction) {
    // Here we are intentionally converting the raw body to req.body.
    // As we need to avoid the signature that can be caused due to the fact that
    // spaces and tabs in json body are left in the req.body even after the conversion to string.
    req.body=(res.locals.rawBody) ? JSON.parse(res.locals.rawBody) : null;
    next();
}