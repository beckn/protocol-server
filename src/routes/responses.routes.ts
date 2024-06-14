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
  openApiValidatorMiddleware
} from "../middlewares/schemaValidator.middleware";
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
      const timestampAuthTracker = {
        start: 0,
        end: 0
      };
      responsesRouter.post(
        `/${action}`,
        (req: Request, res: Response, next: NextFunction) => {
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} REV ENTRY: ${new Date().valueOf()}`
          );
          next();
        },
        jsonCompressorMiddleware,
        (req: any, res: Response, next: NextFunction) => {
          timestampAuthTracker.start = new Date().valueOf();
          next();
        },
        authValidatorMiddleware,
        (req: any, res: Response, next: NextFunction) => {
          timestampAuthTracker.end = new Date().valueOf();
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} AUTH: ${timestampAuthTracker.end - timestampAuthTracker.start} ms`
          );
          next();
        },
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.start = new Date().valueOf();
          next();
        },
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.end = new Date().valueOf();
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} OPENAPI Val: ${timestampTracker.end - timestampTracker.start} ms`
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
      const timestampAuthTracker = {
        start: 0,
        end: 0
      };
      responsesRouter.post(
        `/${action}`,
        (req: any, res: Response, next: NextFunction) => {
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} REV ENTRY: ${new Date().valueOf()}`
          );
          next();
        },
        jsonCompressorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          await contextBuilderMiddleware(req, res, next, action);
        },
        (req: Request, res: Response, next: NextFunction) => {
          timestampAuthTracker.start = new Date().valueOf();
          next();
        },
        authBuilderMiddleware,
        (req: Request, res: Response, next: NextFunction) => {
          timestampAuthTracker.end = new Date().valueOf();
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} AUTH: ${timestampAuthTracker.end - timestampAuthTracker.start} ms`
          );
          next();
        },
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.start = new Date().valueOf();
          next();
        },
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          timestampTracker.end = new Date().valueOf();
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} OPENAPI Val: ${timestampTracker.end - timestampTracker.start} ms`
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
