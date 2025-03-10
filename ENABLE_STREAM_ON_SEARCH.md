# Enabling Streaming on Search

## Overview

This guide explains how to enable **streaming responses** for search requests using the `streamOnSearch` configuration. When enabled, responses will be streamed in real-time instead of being stored in the `SyncCache`.

## How to Enable Streaming

### **1. Update Configuration**

Modify your application configuration file to enable streaming on search.

```typescript
{
  app: {
    streamOnSearch: true, // Enable response streaming for search actions
    actions: {
      requests: {
        search: {
          ttl: 30000 // Timeout for waiting responses (30 seconds)
        }
      }
    }
  }
}
```

- Set `streamOnSearch` to `true` to enable response streaming.
- The `ttl` (Time-To-Live) setting defines how long the system waits for responses before closing the connection.

---

### **2. How Streaming Works**

When `streamOnSearch` is **enabled**:

- Responses are **streamed in real-time** via `eventBus`.
- The server **immediately writes data** to the client when responses arrive.
- The connection stays open until the defined timeout (`ttl`) expires.

When `streamOnSearch` is **disabled**:

- Responses are **stored in `SyncCache`** and retrieved once all responses are received.
- The client waits until the cache is populated before getting the response.

---

### **3. Implementation Details**

#### **Emitting Search Events**

In the response handling logic, responses are **either streamed or stored** based on `streamOnSearch`.

```typescript
if (action && getConfig()?.app?.streamOnSearch) {
  console.log(
    `Streaming enabled. Emitting onSearch event for message_id: ${message_id}`,
  );

  eventBus.emit("onSearch", { message_id, action, responseBody });
} else {
  console.log(
    `Streaming disabled. Inserting response into SyncCache for message_id: ${message_id}`,
  );

  await SyncCache.getInstance().insertResponse(
    message_id,
    action,
    responseBody,
  );
}
```

- If `streamOnSearch` is **enabled**, the event is emitted using `eventBus.emit("onSearch")`.
- If `streamOnSearch` is **disabled**, the response is inserted into `SyncCache`.

#### **Handling Streaming Responses**

When streaming is enabled, the server **writes responses directly** to the client as they arrive.

```typescript
function streamSearchResponses(
  res: Response,
  message_id: string,
  context: any,
  waitTime: number,
) {
  try {
    res.writeHead(200, { "Content-Type": "application/json" });

    const onSearchHandler = ({
      message_id: msg_id,
      responseBody: response,
    }) => {
      try {
        if (message_id === msg_id) {
          res.write(JSON.stringify({ context, responses: [response] }) + "\n");
        }
      } catch (error) {
        console.error("Error writing response:", error);
      }
    };

    eventBus.on("onSearch", onSearchHandler);

    setTimeout(() => {
      try {
        eventBus.off("onSearch", onSearchHandler);
        res.end();
      } catch (error) {
        console.error("Error ending response:", error);
      }
    }, waitTime);
  } catch (error) {
    console.error("Error handling streaming response:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
```

- The `onSearch` event **listens** for incoming responses.
- Each response is **written immediately** to the client.
- The event listener is **removed** after the timeout (`ttl`) to prevent memory leaks.

---

### **4. Debugging & Logs**

- Check if streaming is enabled in logs:
  ```
  Streaming enabled. Emitting onSearch event for message_id: XYZ123
  ```
- If responses are stored instead, you'll see:
  ```
  Streaming disabled. Inserting response into SyncCache for message_id: XYZ123
  ```
- If you experience issues, ensure `eventBus` is correctly initialized.

---

## Conclusion

By enabling `streamOnSearch`, you can **improve response times** by streaming responses in real-time instead of waiting for the full dataset. If disabled, the system will revert to **cached responses** for reliability.

🚀 **Now, your system supports both real-time streaming and sync-based responses!**
