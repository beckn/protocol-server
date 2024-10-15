import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import {
  RequestActions,
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
import { LogLevelEnum } from "../utils/logger.utils";

export const requestsRouter = Router();

requestsRouter.get("/logs", (req, res) => {
  try {
    const logLevel: LogLevelEnum =
      (req?.query?.type as LogLevelEnum) || LogLevelEnum.DEBUG;
    const files = fs.readdirSync(
      path.join(__dirname + `../../../logs/${logLevel}`)
    );
    return res.sendFile(
      path.join(
        __dirname + `../../../logs/${logLevel}/${files[files.length - 1]}`
      ),
      (err) => {
        if (err) {
          res.json({ success: false, message: err.message });
        }
      }
    );
  } catch (error: any) {
    logger.error(error.message);
    throw new Error("Some Error Occured");
  }
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
      const timestampTracker = {
        start: 0,
        end: 0
      };
      const timestampAuthTracker = {
        start: 0,
        end: 0
      };
      requestsRouter.post(
        `/${action}`,
        (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} FORW ENTRY: ${new Date().valueOf()}`
          );
          next();
        },
        jsonCompressorMiddleware,
        async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
          await contextBuilderMiddleware(req, res, next, action);
        },
        (req: any, res: Response<{}, Locals>, next: NextFunction) => {
          timestampAuthTracker.start = new Date().valueOf();
          next();
        },
        authBuilderMiddleware,
        (req: any, res: Response<{}, Locals>, next: NextFunction) => {
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
      const timestampTracker = {
        start: 0,
        end: 0
      };
      const timestampAuthTracker = {
        start: 0,
        end: 0
      };
      requestsRouter.post(
        `/${action}`,
        (req: any, res: Response<{}, Locals>, next: NextFunction) => {
          console.log(
            `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} FORW ENTRY: ${new Date().valueOf()}`
          );
          next();
        },
        jsonCompressorMiddleware,
        (req: any, res: Response<{}, Locals>, next: NextFunction) => {
          timestampAuthTracker.start = new Date().valueOf();
          next();
        },
        authValidatorMiddleware,
        (req: any, res: Response<{}, Locals>, next: NextFunction) => {
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

requestsRouter.get("/health", async (req: Request, res: Response) => {
  try {
    const health = {
      status: "up",
      components: {
        diskSpace: {
          status: "up",
          details: getDiskSpaceDetails()
        }
      }
    };

    res.json(health);
  } catch (error: any) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(500).json({ status: "down", error: error.message });
  }
});

function getDiskSpaceDetails() {
  const path = __dirname;
  return {
    path: path,
    exists: true
  };
}
