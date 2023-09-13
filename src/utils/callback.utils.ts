import axios from "axios";
import { Exception, ExceptionType } from "../models/exception.model";
import {
  BecknErrorDataType,
  becknErrorSchema
} from "../schemas/becknError.schema";
import { requestCallbackSchema } from "../schemas/callbacks/request.callback.schema";
import { responseCallbackSchema } from "../schemas/callbacks/response.callback.schema";
import {
  ClientConfigType,
  WebhookClientConfigDataType
} from "../schemas/configs/client.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getConfig } from "./config.utils";
import logger from "./logger.utils";

async function makeClientCallback(data: any) {
  try {
    if (getConfig().client.type != ClientConfigType.webhook) {
      throw new Exception(
        ExceptionType.Client_InvalidCall,
        "Client type is not webhook",
        500
      );
    }

    const clientConnectionConfig = getConfig().client
      .connection as WebhookClientConfigDataType;
    logger.info(`\nWebhook Triggered on:==> ${clientConnectionConfig.url}\n\n`);
    const response = await axios.post(clientConnectionConfig.url, data);
    logger.info(
      `Response from Webhook:==>\n ${JSON.stringify(
        response.data
      )}\nWith Data\n${JSON.stringify(data)}\n\n`
    );
  } catch (error: any) {
    console.log("Error from makeClient");
    console.log("====>", error);
    if (error instanceof Exception) {
      throw error;
    }

    if (error.response) {
      console.log("\n\n", error, "\n\n");
      throw new Exception(
        ExceptionType.Client_CallbackFailed,
        "Callback to client failed.",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new Exception(
        ExceptionType.Client_CallbackFailed,
        "Callback to client failed.",
        500,
        error.request
      );
    } else {
      throw new Exception(
        ExceptionType.Client_CallbackFailed,
        "Callback to client failed.",
        500,
        error
      );
    }
  }
}

export async function responseCallback(data: any) {
  try {
    logger.info("Response cache SINoin");
    const callbackData = responseCallbackSchema.parse(data);
    await makeClientCallback(callbackData);
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Client_CallbackFailed,
      "Callback to client failed.",
      500,
      error
    );
  }
}

export async function requestCallback(data: any) {
  try {
    const callbackData = requestCallbackSchema.parse(data);
    await makeClientCallback(callbackData);
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Client_CallbackFailed,
      "Callback to client failed.",
      500,
      error
    );
  }
}

export async function errorCallback(context: any, error: BecknErrorDataType) {
  try {
    await makeClientCallback({
      context: context,
      error: error
    });
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Client_CallbackFailed,
      "Callback to client failed.",
      500,
      error
    );
  }
}
