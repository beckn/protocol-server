import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import { buildContext } from "../utils/context.utils";

export async function contextBuilderMiddleware(req: Request, res: Response<{}, Locals>, next: NextFunction, action: string) {
    try {
        const context=buildContext(req.body.context, action);
        req.body.context=context;
        next();
    } catch (error) {
        next(error);
    }
}