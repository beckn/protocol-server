import { NextFunction, Request, Response } from "express";
import * as AmqbLib from "amqplib";
import moment from "moment";
import { RequestActions } from "../schemas/configs/actions.app.config.schema";
import logger from "../utils/logger.utils";
import { Exception, ExceptionType } from "../models/exception.model";
import { acknowledgeACK } from "../utils/acknowledgement.utils";
import { GatewayUtils } from "../utils/gateway.utils";
import { RequestCache } from "../utils/cache/request.cache.utils";
import { parseRequestCache } from "../schemas/cache/request.cache.schema";
import { Locals } from "../interfaces/locals.interface";
import { getConfig } from "../utils/config.utils";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { requestCallback } from "../utils/callback.utils";
import { telemetrySDK } from "../utils/telemetry.utils";
import { createBppWebhookAuthHeaderConfig } from "../utils/auth.utils";

export const bppNetworkRequestHandler = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction,
  action: RequestActions
) => {
  try {
    acknowledgeACK(res, req.body.context);

    const message_id = req.body.context.message_id;
    const transaction_id = req.body.context.transaction_id;
    const ttl = (moment.duration(req.body.context.ttl).asMilliseconds() / 1000);

    await RequestCache.getInstance().cache(
      parseRequestCache(transaction_id, message_id, action, res.locals.sender!, '', ttl),
      600 // Cache expiry time
    );

    const maxRetries = getConfig().app.httpRetryCount;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await GatewayUtils.getInstance().sendToClientSideGateway(req.body);
        break;
      } catch (err) {
        lastError = err;
        if (i === maxRetries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }

    const response = {
      data: JSON.stringify({}),
      status: res.status
    };

    // generate telemetry
    telemetrySDK.onApi({})(req.body, response)
  } catch (err) {
    logger.error(`BPP request failed: ${err}`);
    next(err);
  }
};

export const bppNetworkRequestSettler = async (
  msg: AmqbLib.ConsumeMessage | null
) => {
  try {
    const requestBody = JSON.parse(msg?.content.toString()!);
    console.log(
      `TMTR - ${requestBody?.context?.message_id} - ${requestBody?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} FORW ENTRY: ${new Date().valueOf()}`
    );
    // Generate Telemetry if enabled
    // if (getConfig().app.telemetry.enabled && getConfig().app.telemetry.url) {
    //   telemetryCache
    //     .get("bpp_request_settled")
    //     ?.push(createTelemetryEvent({ context: requestBody.context }));
    //   await processTelemetry();
    // }
    switch (getConfig().client.type) {
      case ClientConfigType.synchronous: {
        throw new Exception(
          ExceptionType.Config_ClientConfig_Invalid,
          "Synchronous mode is not available for BPP.",
          500
        );
        break;
      }
      case ClientConfigType.webhook: {
        let axios_config = {};
        if (getConfig().app.useHMACForWebhook) {
          axios_config = await createBppWebhookAuthHeaderConfig(requestBody);
        }
        requestCallback(requestBody, axios_config);
        break;
      }
      case ClientConfigType.messageQueue: {
        // TODO: implement message queue
        break;
      }
    }
  } catch (err) {
    let exception: Exception | null = null;
    if (err instanceof Exception) {
      exception = err;
    } else {
      exception = new Exception(
        ExceptionType.Request_Failed,
        "BPP Request Failed at bppNetworkRequestSettler",
        500,
        err
      );
    }

    logger.error(exception);
  }
};
