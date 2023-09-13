import { NextFunction, Request, Response, Router } from "express";
import {
  RequestActions,
  ResponseActions
} from "../schemas/configs/actions.app.config.schema";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";
import { jsonCompressorMiddleware } from "../middlewares/jsonParser.middleware";
import {
  authBuilderMiddleware,
  authValidatorMiddleware
} from "../middlewares/auth.middleware";
import { contextBuilderMiddleware } from "../middlewares/context.middleware";
import { openApiValidatorMiddleware } from "../middlewares/schemaValidator.middleware";
import { bapClientTriggerHandler } from "../controllers/bap.trigger.controller";
import { bppNetworkRequestHandler } from "../controllers/bpp.request.controller";
import { Locals } from "../interfaces/locals.interface";
import { unConfigureActionHandler } from "../controllers/unconfigured.controller";
import * as OpenApiValidator from "express-openapi-validator";
import fs from "fs";
import path from "path";

export const requestsRouter = Router();

requestsRouter.get("/logs", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname + "../../../logs/info"));

  return res.sendFile(
    path.join(__dirname + `../../../logs/info/${files[files.length - 1]}`),
    (err) => {
      if (err) {
        res.json({ success: false, message: err.message });
      }
    }
  );
});

// BAP Client-Side Gateway Configuration.
if (
  getConfig().app.mode === AppMode.bap &&
  getConfig().app.gateway.mode === GatewayMode.client
) {
  const requestActions = getConfig().app.actions.requests;
  Object.keys(RequestActions).forEach((action) => {
    if (requestActions[action as RequestActions]) {
      // requestsRouter.post(`/${action}`, jsonCompressorMiddleware, contextBuilderMiddleware, authBuilderMiddleware, openApiValidatorMiddleware, bapClientTriggerHandler);
      requestsRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
          await contextBuilderMiddleware(req, res, next, action);
        },
        authBuilderMiddleware,
        openApiValidatorMiddleware,
        async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
          await bapClientTriggerHandler(
            req,
            res,
            next,
            action as RequestActions
          );
        }
      );
    } else {
      requestsRouter.post(
        `/${action}`,
        async (req: Request, res: Response, next: NextFunction) => {
          await unConfigureActionHandler(req, res, next, action);
        }
      );
    }
  });
}

// BPP Network-Side Gateway Configuration.
if (
  getConfig().app.mode == AppMode.bpp &&
  getConfig().app.gateway.mode === GatewayMode.network
) {
  const requestActions = getConfig().app.actions.requests;
  Object.keys(RequestActions).forEach((action) => {
    if (requestActions[action as RequestActions]) {
      requestsRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        authValidatorMiddleware,
        openApiValidatorMiddleware,
        async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
          await bppNetworkRequestHandler(
            req,
            res,
            next,
            action as RequestActions
          );
        }
      );
    } else {
      requestsRouter.post(
        `/${action}`,
        async (req: Request, res: Response, next: NextFunction) => {
          await unConfigureActionHandler(req, res, next, action);
        }
      );
    }
  });
}
