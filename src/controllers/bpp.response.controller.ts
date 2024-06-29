import { Request, Response, NextFunction } from "express";
import * as AmqbLib from "amqplib";
import moment from "moment";
import { Locals } from "../interfaces/locals.interface";
import {
  ResponseActions
} from "../schemas/configs/actions.app.config.schema";
import logger from "../utils/logger.utils";
import { Exception, ExceptionType } from "../models/exception.model";
import { GatewayUtils } from "../utils/gateway.utils";
import { RequestCache } from "../utils/cache/request.cache.utils";
import { errorCallback } from "../utils/callback.utils";
import { BecknErrorType } from "../schemas/becknError.schema";
import {
  NetworkPaticipantType,
  SubscriberDetail
} from "../schemas/subscriberDetails.schema";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { callNetwork } from "../utils/becknRequester.utils";
import { createAuthHeaderConfig } from "../utils/auth.utils";
import { getConfig } from "../utils/config.utils";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { ActionUtils } from "../utils/actions.utils";
import { acknowledgeACK } from "../utils/acknowledgement.utils";
import { telemetryCache } from "../schemas/cache/telemetry.cache";
import {
  createTelemetryEvent,
  processTelemetry
} from "../utils/telemetry.utils";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getSubscriberDetails } from "../utils/lookup.utils";

export const bppClientResponseHandler = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction,
  action: ResponseActions
) => {
  try {
    acknowledgeACK(res, req.body.context);
    await GatewayUtils.getInstance().sendToNetworkSideGateway(req.body);
    console.log(
      `TMTR - ${req?.body?.context?.message_id} - ${req?.body?.context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} REV EXIT: ${new Date().valueOf()}`
    );
  } catch (err) {
    let exception: Exception | null = null;
    if (err instanceof Exception) {
      exception = err;
    } else {
      exception = new Exception(
        ExceptionType.Request_Failed,
        "BPP Response Failed at bppClientResponseHandler",
        500,
        err
      );
    }

    logger.error(exception);
  }
};

export const bppClientResponseSettler = async (
  msg: AmqbLib.ConsumeMessage | null
) => {
  try {
    const responseBody = JSON.parse(msg?.content.toString()!);
    const context = JSON.parse(JSON.stringify(responseBody.context));
    const message_id = responseBody.context.message_id;
    console.log(
      `TMTR - ${context?.message_id} - ${context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} REV ENTRY: ${new Date().valueOf()}`
    );
    const requestAction = ActionUtils.getCorrespondingRequestAction(
      responseBody.context.action
    );
    const action = context.action;
    const { bap_uri, bap_id } = responseBody.context;

    const requestCache = await RequestCache.getInstance().check(
      message_id,
      requestAction
    );
    if (requestCache) {
      const now = moment().valueOf();
      const { timestamp = 0, ttl = 0 } = requestCache as any;
      if (((now - timestamp) / 1000) > ttl) {
        // Delayed message
        logger.info(
          `\Delayed message received at BAP Network message id: ${message_id}\n\n`
        );
        errorCallback(context, {
          // TODO: change this error code.
          code: 651641,
          type: BecknErrorType.coreError,
          message: "Request timed out"
        });
        return;
      }
    }

    const axios_config = await createAuthHeaderConfig(responseBody);

    let response: BecknResponse | null = null;
    if (requestCache) {
      if (requestCache.sender.type == NetworkPaticipantType.BG) {
        const subscribers = [requestCache.sender];

        response = await callNetwork(
          subscribers,
          responseBody,
          axios_config,
          action
        );
      } else {
        const subscribers: Array<SubscriberDetail> = [
          {
            ...requestCache.sender,
            subscriber_url: bap_uri
          }
        ];

        response = await callNetwork(
          subscribers,
          responseBody,
          axios_config,
          action
        );
      }
    } else {
      // Handling of unsolicited message
      const subscriberDetails = await getSubscriberDetails(bap_id);
      const subscribers: Array<SubscriberDetail> = [{ ...subscriberDetails }];
      response = await callNetwork(
        subscribers,
        responseBody,
        axios_config,
        action
      );
    }

    if (
      response.status == 200 ||
      response.status == 202 ||
      response.status == 206
    ) {
      // Network Calls Succeeded.
      // Generate Telemetry if enabled
      if (getConfig().app.telemetry.enabled && getConfig().app.telemetry.url) {
        console.log("121========>");
        telemetryCache.get("bpp_client_settled")?.push(
          createTelemetryEvent({
            context: responseBody.context,
            data: response
          })
        );
        await processTelemetry();
      }
      return;
    }

    switch (getConfig().client.type) {
      case ClientConfigType.synchronous: {
        throw new Exception(
          ExceptionType.Config_ClientConfig_Invalid,
          "Synchronous mode is not available for BPP.",
          400
        );
        break;
      }
      case ClientConfigType.messageQueue: {
        // TODO: implement message queue.
        break;
      }
      case ClientConfigType.webhook: {
        if (getConfig().app.gateway.mode !== GatewayMode.network) {
          errorCallback(context, {
            // TODO: change the error code.
            code: 354845,
            message: "Network call failed",
            type: BecknErrorType.coreError,
            data: [response]
          });
        }
        break;
      }
    }
  } catch (error) {
    let exception: Exception | null = null;
    if (error instanceof Exception) {
      exception = error;
    } else {
      exception = new Exception(
        ExceptionType.Request_Failed,
        "BPP Response Failed at bppClientResponseSettler",
        500,
        error
      );
    }

    logger.error(exception);
  }
};
