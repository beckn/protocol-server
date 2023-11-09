import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import { AppMode } from "../schemas/configs/app.config.schema";
import { getConfig } from "../utils/config.utils";
import { bapContextBuilder, bppContextBuilder } from "../utils/context.utils";

export async function contextBuilderMiddleware(
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction,
  action: string
) {
  try {
    let context = null;
    switch (getConfig().app.mode) {
      case AppMode.bap: {
        context = await bapContextBuilder(req.body.context, action);
        break;
      }
      case AppMode.bpp: {
        context = bppContextBuilder(req.body.context, action);
        break;
      }
    }

    req.body.context = context;

    next();
  } catch (error) {
    next(error);
  }
}
