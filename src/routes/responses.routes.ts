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
import {
  schemaErrorHandler,
  openApiValidatorMiddleware
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
      const timestampTracker = {
        start: 0,
        end: 0
      };

      responsesRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        authValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.start = new Date().valueOf();
          next();
        },
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.end = new Date().valueOf();
          console.log(
            `############################################ ${
              getConfig().app.mode
            }-${getConfig().app.gateway.mode} OPENAPI Validator started at: ${
              timestampTracker.start
            } and ended at: ${timestampTracker.end}.
             Total difference is ${
               timestampTracker.end - timestampTracker.start
             } milliseconds,
              message ID is ${req?.body?.context?.message_id}
              action is ${req?.body?.context?.action}`
          );
          next();
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
      const timestampTracker = {
        start: 0,
        end: 0
      };
      responsesRouter.post(
        `/${action}`,
        jsonCompressorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          await contextBuilderMiddleware(req, res, next, action);
        },
        authBuilderMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.start = new Date().valueOf();
          next();
        },
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.end = new Date().valueOf();
          console.log(
            `############################################ ${
              getConfig().app.mode
            }-${getConfig().app.gateway.mode} OPENAPI Validator started at: ${
              timestampTracker.start
            } and ended at: ${timestampTracker.end}.
             Total difference is ${
               timestampTracker.end - timestampTracker.start
             } milliseconds,
              message ID is ${req?.body?.context?.message_id}
              action is ${req?.body?.context?.action}`
          );
          next();
        },
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
