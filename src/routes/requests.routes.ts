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
import openApiValidatorMiddleware, {
  schemaErrorHandler
} from "../middlewares/schemaValidator.middleware";
import { bapClientTriggerHandler } from "../controllers/bap.trigger.controller";
import { bppNetworkRequestHandler } from "../controllers/bpp.request.controller";
import { Locals } from "../interfaces/locals.interface";
import { unConfigureActionHandler } from "../controllers/unconfigured.controller";
import * as OpenApiValidator from "express-openapi-validator";

export const requestsRouter = Router();

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

        async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
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
        authBuilderMiddleware,
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
