import Express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Exception } from "./models/exception.model";
import {
  BecknErrorDataType,
  BecknErrorType
} from "./schemas/becknError.schema";
import { LookupCache } from "./utils/cache/lookup.cache.utils";
import { RequestCache } from "./utils/cache/request.cache.utils";
import { ResponseCache } from "./utils/cache/response.cache.utils";
import { ClientUtils } from "./utils/client.utils";
import { getConfig } from "./utils/config.utils";
import { GatewayUtils } from "./utils/gateway.utils";
import logger from "./utils/logger.utils";
import { Validator } from "./middlewares/validator";
import { getTelemetryConfig, telemetrySDK } from "./utils/telemetry.utils";
import express from "express";
import path from "path";
import _sodium from "libsodium-wrappers";

const app = Express();

app.use(
  Express.json({
    limit: "200kb"
  })
);

const initializeExpress = async () => {
  const app = Express();
  app.use(
    require("express-status-monitor")({
      path: "/process"
    })
  );
  app.use("/public", express.static(path.join(__dirname, "../public")));
  app.get(
    "/status",
    async (req: Request, res: Response, next: NextFunction) => {
      res
        .status(200)
        .send("Added logic to cache OpenAPI validator spec on app load new");
    }
  );

  // Enabling Cors
  app.options(
    "*",
    cors<Request>({
      origin: "*",
      optionsSuccessStatus: 200,
      credentials: true,
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"]
    })
  );

  // Middleware for request body conversion to json and raw body creation.
  app.use(
    Express.json({
      verify: (req: Request, res: Response, buf: Buffer) => {
        res.locals = {
          rawBody: buf.toString()
        };
      },
      limit: "200kb"
    })
  );

  app.use(telemetrySDK.init(getTelemetryConfig()));

  // Request Logger.
  app.use("/", async (req: Request, res: Response, next: NextFunction) => {
    //logger.info(JSON.stringify(req.body));
    next();
  });

  // Test Routes
  const testRouter = require("./routes/test.routes").default;
  app.use("/test", testRouter);

  app.post("/on_subscribe", async (req: Request, res: Response) => {
    console.log(`on_subscribe API invoked at ${new Date().toISOString()}`);
    console.log("Received request body:", req.body);

    // Validate request body has required fields
    if (!req.body || typeof req.body !== "object") {
      const response = { message: "Invalid request body" };
      console.log("Sending error response:", response);
      return res.status(400).json(response);
    }

    const { challenge } = req.body;

    if (!challenge || typeof challenge !== "string") {
      const response = { message: "Missing or invalid challenge" };
      console.log("Sending error response:", response);
      return res.status(400).json(response);
    }

    console.log("Extracted challenge:", challenge);

    await _sodium.ready;
    const sodium = _sodium;

    const privateKey = getConfig().app.privateKey;
    console.log(
      "Retrieved privateKey from config:",
      privateKey ? privateKey : "Not Found"
    );

    let privateKeyBase64 = privateKey;

    // Check if the input is already Base64 (valid Base64 strings end with '=' or contain certain characters)
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    if (base64Pattern.test(privateKey)) {
      console.log("Private key is already in Base64 format.");
    } else {
      // Convert raw input (Hex, ASCII, etc.) to Base64
      console.log("Converting private key to Uint8Array...");
      const privateKeyUint8 = sodium.from_string(privateKey);
      console.log("Converted privateKey to Uint8Array.");
      privateKeyBase64 = sodium.to_base64(
        privateKeyUint8,
        sodium.base64_variants.ORIGINAL
      );
      console.log("Converted privateKey to Base64:", privateKeyBase64);
    }

    // Convert private key from Base64 to Uint8Array
    console.log("Decoding privateKey from Base64 to Uint8Array...");

    function padBase64(str: string) {
      const padLength = 4 - (str.length % 4);
      return str + "=".repeat(padLength === 4 ? 0 : padLength);
    }

    const safeBase64 = padBase64(privateKeyBase64.trim());
    const pvtKey = sodium.from_base64(
      safeBase64,
      sodium.base64_variants.ORIGINAL
    );
    console.log("Private key successfully decoded.");

    // Sign the message
    console.log("Signing the challenge...");
    const signedMessage = sodium.crypto_sign(challenge, pvtKey);
    console.log("Challenge successfully signed.");

    // Convert signed message to Base64 for easy storage/transmission
    const signedChallenge = sodium.to_base64(
      signedMessage,
      sodium.base64_variants.ORIGINAL
    );
    console.log("Signed challenge converted to Base64:", signedChallenge);

    const response = { answer: signedChallenge };
    console.log("Sending response:", response);
    res.status(200).json(response);
  });

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
        type: BecknErrorType.domainError
      } as BecknErrorDataType;
      res.status(err.code).json({
        message: {
          ack: {
            status: "NACK"
          }
        },
        error: errorData
      });
    } else {
      res.status(err.code || 500).json({
        message: {
          ack: {
            status: "NACK"
          }
        },
        error: err
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
    logger.info("Initialized openapi validator middleware");
  } catch (err) {
    if (err instanceof Exception) {
      logger.error(err.toString());
    } else {
      logger.error(err);
    }
  }
};

main();
