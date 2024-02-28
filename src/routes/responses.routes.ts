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

// @ts-ignore
import TelemetrySDK from 'beckn-telemetry-sdk';


export const responsesRouter = Router();
responsesRouter.use(TelemetrySDK.init(getTelemetryConfig()));

const onAPI = (request: Request, response: Response, next: NextFunction) => {
  const mode = request.get('mode');
  TelemetrySDK.onApi({data: { attributes: { mode }}})(request, response, next)
}

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
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          logger.info(`response from bpp: ${JSON.stringify(req.body)}`);
          await bapNetworkResponseHandler(
            req,
            res,
            next,
            action as ResponseActions
          );
        },
        onAPI
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
        openApiValidatorMiddleware,
        async (req: Request, res: Response, next: NextFunction) => {
          await bppClientResponseHandler(
            req,
            res,
            next,
            action as ResponseActions
          );
        },
        onAPI
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

function getTelemetryConfig() {
  const telemetryConfig: any = {
    "participantId": getConfig().app.subscriberId,
    "participantUri": getConfig().app.subscriberUri,
    "role": getConfig().app.mode,
    "telemetry": {
      "batchSize": getConfig().app.telemetry.batchSize,
      "syncInterval": getConfig().app.telemetry.syncInterval,
      "retry": getConfig().app.httpRetryCount,
      "storageType": getConfig().app.telemetry.storageType,
      "backupFilePath": getConfig().app.telemetry.backupFilePath,
      "redis": {
        "host": getConfig().cache.host,
        "port": getConfig().cache.port,
        "db": getConfig().app.telemetry.redis.db
      },
      "network": {
        "url": getConfig().app.telemetry.network.url
      },
      "raw": {
        "url": getConfig().app.telemetry.raw.url
      }
    },
    "service": {
      "name": getConfig().app.service.name,
      "version": getConfig().app.service.version
    }
  }
  return telemetryConfig;
}