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
  context: any
) {
  try {
    if (getConfig().client.type != ClientConfigType.synchronous) {
      throw new Exception(
        ExceptionType.Client_InvalidCall,
        "Synchronous client is not configured.",
        500
      );
    }

    const syncCache = SyncCache.getInstance();
    syncCache.initCache(message_id, action);

    const waitTime = getConfig().app.actions.requests[action]?.ttl
      ? getConfig().app.actions.requests[action]?.ttl!
      : 30 * 1000;

    let curr_timeStamp = Date.now();

    if (action === "search" && getConfig().app.streamOnSearch) {
      // **Use the streaming approach if streamOnSearch is enabled**
      streamSearchResponses(res, message_id, context, waitTime);
      return; // Exit early to prevent syncCache execution
    }

    // **Sync Cache Approach**
    if (
      action === "search" &&
      !context?.bpp_id &&
      !context.bpp_uri
    ) {
      await sleep(waitTime);
    }
    let syncCacheData: SyncCacheDataType | null = null;

    do {
      syncCacheData = await syncCache.getData(message_id, action);
      if (!syncCacheData || !syncCacheData?.responses.length) {
        await sleep(100);
      }
    } while (
      (!syncCacheData || !syncCacheData?.responses.length) &&
      Date.now() - curr_timeStamp < waitTime
    );

    if (!syncCacheData) {
      throw new Exception(
        ExceptionType.Client_SyncCacheDataNotFound,
        `Sync cache data not found for message_id: ${message_id} and action: ${action}`,
        404
      );
    }

    if (syncCacheData.error) {
      res.status(400).json({
        context,
        error: syncCacheData.error
      });
      return;
    }
    console.log(
      `TMTR - ${context?.message_id} - ${context?.action} - ${getConfig().app.mode}-${getConfig().app.gateway.mode} REV EXIT: ${new Date().valueOf()}`
    );
    res.status(200).json({
      context,
      responses: syncCacheData.responses || []
    });
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Client_SendSyncReponsesFailed,
      "Send Synchronous Responses Failed.",
      500,
      error
    );
  }
}

/**
 * Streams search responses in real-time when `streamOnSearch` is enabled.
 * 
 * This function listens for `onSearch` events and writes responses as they arrive.
 * It ensures that:
 * - The client receives partial responses immediately.
 * - The connection is properly cleaned up when the timeout occurs.
 *
 * @param res - Express Response object to send data to the client.
 * @param message_id - The unique message ID for the search request.
 * @param context - Additional metadata/context for the response.
 * @param waitTime - The maximum duration (in milliseconds) to keep the connection open.
 */
function streamSearchResponses(
  res: Response,
  message_id: string,
  context: any,
  waitTime: number
) {
  try {
    // Set response headers for streaming JSON data
    res.writeHead(200, { "Content-Type": "application/json" });

    /**
     * Event handler for processing "onSearch" responses.
     * This function is triggered every time a new search result arrives.
     */
    const onSearchHandler = ({
      message_id: msg_id,
      responseBody: response,
    }: {
      message_id: string;
      responseBody: unknown;
    }) => {
      try {
        // Ensure the event corresponds to the correct message_id
        if (message_id === msg_id) {
          res.write(
            JSON.stringify({
              context,
              responses: [response], // Wrap response in an array for consistency
            }) + "\n" // Newline for easy parsing in streaming clients
          );
        }
      } catch (error) {
        console.error("Error writing response:", error);
      }
    };

    // Subscribe to the eventBus for incoming "onSearch" responses
    eventBus.on("onSearch", onSearchHandler);

    /**
     * Cleanup function: 
     * - Stops listening to "onSearch" events
     * - Closes the response stream after the specified `waitTime`
     */
    setTimeout(() => {
      try {
        eventBus.off("onSearch", onSearchHandler); // Unregister listener to prevent memory leaks
        res.end(); // End the response to close the connection
      } catch (error) {
        console.error("Error ending response:", error);
      }
    }, waitTime);
  } catch (error) {
    console.error("Error handling streaming search response:", error);

    // Send an internal server error response if something fails
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}


function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve("");
    }, ms)
  );
}
