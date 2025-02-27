**Streaming Response Approach for Search API Optimization**

## **1. Introduction**

### **Current Issue:**

- The existing approach waits for all BPP (Beckn Protocol Provider) responses to be collected in MongoDB before sending a response to the client.
- TTL (Time-To-Live) for response collection is **5-15 seconds**.
- If a BPP response arrives **after the TTL**, it is ignored.
- This causes **unnecessary delays** in responding to clients.

### **Proposed Solution:**

- Implement **streaming responses** using `res.write()` in Express.js.
- As soon as a response reaches the BAP (Beckn API Provider) client, it is immediately streamed to the client.
- **TTL still exists**, but instead of waiting for it to expire, clients get responses **as they arrive**.

---

## **2. Old Approach (Waiting for TTL)**

### **Issues:**

- **Delays in API response** until TTL expires.
- **Late responses from BPP are ignored.**
- **MongoDB dependency** for fetching responses before sending to clients.

#### **Old Code**

```typescript
import { Response } from "express";
import { Exception, ExceptionType } from "../models/exception.model";
import { RequestActions } from "../schemas/configs/actions.app.config.schema";
import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { SyncCache } from "./cache/sync.cache.utils";
import { getConfig } from "./config.utils";
import { SyncCacheDataType } from "../schemas/cache/sync.cache.schema";

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

    const waitTime = getConfig().app.actions.requests[action]?.ttl || 30 * 1000;
    let curr_timeStamp = Date.now();

    if (action === "search" && !context?.bpp_id && !context.bpp_uri) {
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
        404,
      );
    }

    res.status(200).json({
      context,
      responses: syncCacheData.responses || [],
    });
  } catch (error) {
    throw new Exception(
      ExceptionType.Client_SendSyncReponsesFailed,
      "Send Synchronous Responses Failed.",
      500,
      error,
    );
  }
}
```

---

## **3. New Approach (Streaming Responses in Real-Time)**

### **Enhancements:**

- **Immediate Response Streaming**: Responses are streamed to the client as they arrive.
- **Handles Late Responses**: Responses arriving after TTL will still be received.
- **Efficient Resource Usage**: Reduces database polling for responses.

#### **New Code**

```typescript
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
    const waitTime = getConfig().app.actions.requests[action]?.ttl || 30 * 1000;

    console.time("onSearch Event Execution");
    res.writeHead(200, { "Content-Type": "application/json" });

    eventBus.on(
      "onSearch",
      ({ message_id: msg_id, responseBody: response }) => {
        if (message_id == msg_id) {
          console.log("Streaming Response:", JSON.stringify(response));
          res.write(
            JSON.stringify({
              context,
              responses: [response],
            }) + "\n",
          );
        }
      },
    );

    // End the response after TTL expires
    setTimeout(() => {
      res.end();
      console.timeEnd("onSearch Event Execution");
    }, waitTime);
  } catch (error) {
    throw new Exception(
      ExceptionType.Client_SendSyncReponsesFailed,
      "Send Synchronous Responses Failed.",
      500,
      error,
    );
  }
}
```

---

## **4. Key Benefits of the New Approach**

| Feature           | Old Approach                   | New Approach                    |
| ----------------- | ------------------------------ | ------------------------------- |
| Response Time     | Delayed until TTL expires      | Immediate streaming of data     |
| Late Responses    | Ignored if received after TTL  | Handled via streaming           |
| MongoDB Usage     | Heavy polling required         | Reduces unnecessary reads       |
| Client Experience | Client waits for all responses | Receives responses in real-time |

---

## **5. Conclusion**

This new approach significantly reduces **search API response time** by leveraging Express.js **streaming responses**. The changes enhance **real-time response delivery**, reduce **dependency on MongoDB**, and allow **late responses to be processed** without being ignored.
