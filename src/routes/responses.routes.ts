import { NextFunction, Request, Response, Router } from "express";
import { bapNetworkResponseHandler } from "../controllers/bap.response.controller";
import { bppClientResponseHandler } from "../controllers/bpp.response.controller";
import { unConfigureActionHandler } from "../controllers/unconfigured.controller";
import {
  authBuilderMiddleware,
  authValidatorMiddleware
} from "../middlewares/auth.middleware";
import { contextBuilderMiddleware } from "../middlewares/context.middleware";
import { jsonCompressorMiddleware } from "../middlewares/jsonParser.middleware";
import openApiValidatorMiddleware, {
  schemaErrorHandler
} from "../middlewares/schemaValidator.middleware";
import * as OpenApiValidator from "express-openapi-validator";
import { ResponseActions } from "../schemas/configs/actions.app.config.schema";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";

export const responsesRouter = Router();

// BAP Network-Side Gateway Configuration.
if (
  getConfig().app.mode === AppMode.bap &&
  getConfig().app.gateway.mode === GatewayMode.network
) {
  const responseActions = getConfig().app.actions.responses;
  Object.keys(ResponseActions).forEach((action) => {
    if (responseActions[action as ResponseActions]) {
      responsesRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        authValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          const version = req?.body?.context?.core_version
            ? req?.body?.context?.core_version
            : req?.body?.context?.version;
          const openApiValidator = OpenApiValidator.middleware({
            apiSpec: `schemas/core_${version}.yaml`,
            validateRequests: true,
            validateResponses: false,
            $refParser: {
              mode: "dereference"
            }
          });

          const walkSubstack = function (
            stack: any,
            req: any,
            res: any,
            next: NextFunction
          ) {
            if (typeof stack === "function") {
              stack = [stack];
            }
            const walkStack = function (i: any, err?: any) {
              if (err) {
                return schemaErrorHandler(err, req, res, next);
              }
              if (i >= stack.length) {
                return next();
              }
              stack[i](req, res, walkStack.bind(null, i + 1));
            };
            walkStack(0);
          };
          walkSubstack([...openApiValidator], req, res, next);
        },
        async (req: Request, res: Response, next: NextFunction) => {
          logger.info(`response from bpp: ${JSON.stringify(req.body)}`);
          await bapNetworkResponseHandler(
            req,
            res,
            next,
            action as ResponseActions
          );
        }
      );
    } else {
      responsesRouter.post(
        `/${action}`,
        async (req: Request, res: Response, next: NextFunction) => {
          await unConfigureActionHandler(req, res, next, action);
        }
      );
    }
  });
}

// BPP Client-Side Gateway Configuration.
if (
  getConfig().app.mode === AppMode.bpp &&
  getConfig().app.gateway.mode === GatewayMode.client
) {
  const responseActions = getConfig().app.actions.responses;
  Object.keys(ResponseActions).forEach((action) => {
    if (responseActions[action as ResponseActions]) {
      responsesRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          await contextBuilderMiddleware(req, res, next, action);
        },
        authBuilderMiddleware,
        [...openApiValidatorMiddleware],
        async (req: Request, res: Response, next: NextFunction) => {
          await bppClientResponseHandler(
            req,
            res,
            next,
            action as ResponseActions
          );
        }
      );
    } else {
      responsesRouter.post(
        `/${action}`,
        async (req: Request, res: Response, next: NextFunction) => {
          await unConfigureActionHandler(req, res, next, action);
        }
      );
    }
  });
}
