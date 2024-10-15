import Express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Exception } from "./models/exception.model";
import {
  BecknErrorDataType,
  BecknErrorType,
} from "./schemas/becknError.schema";
import { LookupCache } from "./utils/cache/lookup.cache.utils";
import { RequestCache } from "./utils/cache/request.cache.utils";
import { ResponseCache } from "./utils/cache/response.cache.utils";
import { ClientUtils } from "./utils/client.utils";
import { getConfig } from "./utils/config.utils";
import { GatewayUtils } from "./utils/gateway.utils";
import logger from "./utils/logger.utils";
import { Validator } from "./middlewares/validator";

const app = Express();

app.use(
  Express.json({
    limit: "200kb",
  })
);

const initializeExpress = async () => {
  const app = Express();
  app.use(
    require("express-status-monitor")({
      path: "/process"
    })
  );
  app.get("/status", async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('Added logic to cache OpenAPI validator spec on app load new');
  });

  // Enabling Cors
  app.options(
    "*",
    cors<Request>({
      origin: "*",
      optionsSuccessStatus: 200,
      credentials: true,
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  // Middleware for request body conversion to json and raw body creation.
  app.use(
    Express.json({
      verify: (req: Request, res: Response, buf: Buffer) => {
        res.locals = {
          rawBody: buf.toString(),
        };
      },
      limit: "200kb",
    })
  );

  // Request Logger.
  app.use("/", async (req: Request, res: Response, next: NextFunction) => {
    //logger.info(JSON.stringify(req.body));
    next();
  });

  // Test Routes
  const testRouter = require("./routes/test.routes").default;
  app.use("/test", testRouter);

  // Requests Routing.
  const { requestsRouter } = require("./routes/requests.routes");
  app.use("/", requestsRouter);

  // Response Routing.
  const { responsesRouter } = require("./routes/responses.routes");
  app.use("/", responsesRouter);

  // Error Handler.
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof Exception) {
      const errorData = {
        code: err.code,
        message: err.message,
        data: err.errorData,
        type: BecknErrorType.domainError,
      } as BecknErrorDataType;
      res.status(err.code).json({
        message: {
          ack: {
            status: "NACK",
          },
        },
        error: errorData,
      });
    } else {
      res.status(err.code || 500).json({
        message: {
          ack: {
            status: "NACK",
          },
        },
        error: err,
      });
    }
  });

  const PORT: number = getConfig().server.port;
  app.listen(PORT, () => {
    logger.info("Protocol Server started on PORT : " + PORT);
  });
};

const main = async () => {
  try {
    await ClientUtils.initializeConnection();
    await GatewayUtils.getInstance().initialize();
    if (getConfig().responseCache.enabled) {
      await ResponseCache.getInstance().initialize();
    }
    await LookupCache.getInstance().initialize();
    await RequestCache.getInstance().initialize();

    await initializeExpress();
    logger.info("Protocol Server Started Successfully");
    logger.info("Mode: " + getConfig().app.mode.toLocaleUpperCase());
    logger.info(
      "Gateway Type: " +
      getConfig().app.gateway.mode.toLocaleUpperCase().substring(0, 1) +
      getConfig().app.gateway.mode.toLocaleUpperCase().substring(1)
    );
    await Validator.getInstance().initialize();
    logger.info('Initialized openapi validator middleware');
  } catch (err) {
    if (err instanceof Exception) {
      logger.error(err.toString());
    } else {
      logger.error(err);
    }
  }
};

main();
