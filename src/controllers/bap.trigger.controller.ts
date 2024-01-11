import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import { RequestActions } from "../schemas/configs/actions.app.config.schema";
import logger from "../utils/logger.utils";
import * as AmqbLib from "amqplib";
import {
  acknowledgeACK,
  acknowledgeNACK
} from "../utils/acknowledgement.utils";
import { BecknErrorType } from "../schemas/becknError.schema";
import { getConfig } from "../utils/config.utils";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { RequestCache } from "../utils/cache/request.cache.utils";
import { parseRequestCache } from "../schemas/cache/request.cache.schema";
import { GatewayUtils } from "../utils/gateway.utils";
import { sendSyncResponses } from "../utils/syncResponses.utils";
import { Exception, ExceptionType } from "../models/exception.model";
import { createAuthHeaderConfig } from "../utils/auth.utils";
import { registryLookup } from "../utils/lookup.utils";
import { NetworkPaticipantType } from "../schemas/subscriberDetails.schema";
import { callNetwork } from "../utils/becknRequester.utils";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { SyncCache } from "../utils/cache/sync.cache.utils";
import { errorCallback } from "../utils/callback.utils";
import { telemetryCache } from "../schemas/cache/telemetry.cache";
import { createTelemetryEvent, pushTelemetry } from "../utils/telemetry.utils";

export const bapClientTriggerHandler = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction,
  action: RequestActions
) => {
  try {
    const bpp_id: string | undefined = req.body.context.bpp_id;
    const bpp_uri: string | undefined = req.body.context.bpp_uri;
    if (
      action != RequestActions.search &&
      (!bpp_id || !bpp_uri || bpp_id == "" || bpp_uri == "")
    ) {
      acknowledgeNACK(res, req.body.context, {
        // TODO: change the error code.
        code: 6781616,
        message:
          "All triggers other than search requires bpp_id and bpp_uri. \nMissing bpp_id or bpp_uri",
        type: BecknErrorType.contextError
      });
      return;
    }

    if (getConfig().client.type == ClientConfigType.webhook) {
      acknowledgeACK(res, req.body.context);
    }

    await RequestCache.getInstance().cache(
      parseRequestCache(
        req.body.context.transaction_id,
        req.body.context.message_id,
        action,
        res.locals.sender!
      ),
      getConfig().app.actions.requests[action]?.ttl!
    );

    logger.info("sending message to outbox queue \n\n");
    logger.info(`Request from client:\n ${JSON.stringify(req.body)}\n`);
    await GatewayUtils.getInstance().sendToNetworkSideGateway(req.body);

    if (getConfig().client.type == ClientConfigType.synchronous) {
      sendSyncResponses(
        res,
        req.body.context.message_id,
        action,
        req.body.context
      );
    }
  } catch (err) {
    let exception: Exception | null = null;
    if (err instanceof Exception) {
      exception = err;
    } else {
      exception = new Exception(
        ExceptionType.Request_Failed,
        "BAP Request Failed at bapClientTriggerHandler",
        500,
        err
      );
    }

    logger.error(exception);
  }
};

export const bapClientTriggerSettler = async (
  message: AmqbLib.ConsumeMessage | null
) => {
  try {
    logger.info(
      "Protocol Network Server (Client Settler) recieving message from outbox queue"
    );

    const requestBody = JSON.parse(message?.content.toString()!);
    logger.info(`request: ${JSON.stringify(requestBody)}`);

    const context = JSON.parse(JSON.stringify(requestBody.context));
    const axios_config = await createAuthHeaderConfig(requestBody);

    const bpp_id = requestBody.context.bpp_id;
    const bpp_uri = requestBody.context.bpp_uri;
    const action = requestBody.context.action;

    let response: BecknResponse | undefined;
    if (bpp_id && bpp_uri && bpp_id !== "" && bpp_uri !== "") {
      const subscribers = await registryLookup({
        type: NetworkPaticipantType.BPP,
        domain: requestBody.context.domain,
        subscriber_id: bpp_id
      });

      for (let i = 0; i < subscribers!.length; i++) {
        subscribers![i].subscriber_url = bpp_uri;
      }

      response = await callNetwork(
        subscribers!,
        requestBody,
        axios_config,
        action
      );
    } else {
      const subscribers = await registryLookup({
        type: NetworkPaticipantType.BG,
        domain: requestBody.context.domain
      });

      response = await callNetwork(
        subscribers!,
        requestBody,
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
      if(getConfig().app.telemetry.enabled) {
        telemetryCache.get("bap_client_settled")?.push(createTelemetryEvent({context: requestBody.context, data: response}));
        await pushTelemetry();
      }
      return;
    }

    switch (getConfig().client.type) {
      case ClientConfigType.synchronous: {
        const message_id = requestBody.context.message_id;
        await SyncCache.getInstance().recordError(
          message_id,
          action as RequestActions,
          {
            // TODO: change this error code.
            code: 651641,
            type: BecknErrorType.coreError,
            message: "Network Participant Request Failed...",
            data: [response]
          }
        );
        break;
      }
      case ClientConfigType.messageQueue: {
        // TODO: Implement message queue.
        break;
      }
      case ClientConfigType.webhook: {
        await errorCallback(context, {
          // TODO: change this error code.
          code: 651641,
          type: BecknErrorType.coreError,
          message: "Network Participant Request Failed...",
          data: [response]
        });
        break;
      }
    }

    return;
  } catch (err) {
    let exception: Exception | null = null;
    if (err instanceof Exception) {
      exception = err;
    } else {
      exception = new Exception(
        ExceptionType.Request_Failed,
        "BAP Request Failed at bapClientTriggerSettler",
        500,
        err
      );
    }

    logger.error(exception);
  }
};
