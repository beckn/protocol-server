import { Response } from "express";
import { Exception, ExceptionType } from "../models/exception.model";
import { RequestActions } from "../schemas/configs/actions.app.config.schema";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { SyncCache } from "./cache/sync.cache.utils";
import { getConfig } from "./config.utils";
import { SyncCacheDataType } from "../schemas/cache/sync.cache.schema";
import eventBus from "./eventBus.utils";

export async function sendSyncResponses(
  res: Response,
  message_id: string,
  action: RequestActions,
  context: any,
) {
  try {
    if (getConfig().client.type != ClientConfigType.synchronous) {
      throw new Exception(
        ExceptionType.Client_InvalidCall,
        "Synchronous client is not configured.",
        500,
      );
    }

    const syncCache = SyncCache.getInstance();
    syncCache.initCache(message_id, action);

    const waitTime = getConfig().app.actions.requests[action]?.ttl
      ? getConfig().app.actions.requests[action]?.ttl!
      : 30 * 1000;

    if (action === "search" && !context?.bpp_id && !context.bpp_uri) {
      console.time("onSearch Event Execution");
      res.writeHead(200, { "Content-Type": "application/json" });
      eventBus.on(
        "onSearch",
        ({ message_id: msg_id, responseBody: response }) => {
          console.log(
            "On Search Response Event CB ======>",
            JSON.stringify(response),
          );
          console.timeEnd("onSearch Event Execution");
          console.log({ message_id, msg_id });
          if (message_id == msg_id)
            res.write(
              JSON.stringify({
                context,
                responses: [response],
              }) + "\n",
            );
        },
      );
      setTimeout(() => {
        res.end();
      }, waitTime);
    }
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Client_SendSyncReponsesFailed,
      "Send Synchronous Responses Failed.",
      500,
      error,
    );
  }
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve("");
    }, ms),
  );
}
