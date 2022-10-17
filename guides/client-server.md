# Client-Server Communication Guide

This guide describes how to communicate with the Beckn Protocol Server. As the Beckn Protocol Server follows the Beckn Protocol, each request and response will be as per the Beckn Protocol. So, in order to communicate with the Beckn Protocol Server, you need to follow the Beckn Protocol.

The communication protocol between the client-side application and the Beckn Protocol Server varies depending on the type of client connection configuration.

There are two types of client connection configurations:

1.  `Synchronous`: The client-side application sends a request to the Beckn Protocol Server and waits for the response. The response is returned with the same request in the same session. (Not available in BPP Mode.)
2.  `Webhook`: The client-side application sends a request to the Beckn Protocol Server using a webhook. The response is also returned using a webhook

This can be categorised into two types:

1. Synchronous: The client-side application gets the response in the same session.
2. Asynchronous: The client-side application gets the response in a different session. Webhook is considered Asynchronous.

The communication protocol varies for Synchronous and Asynchronous client connection configurations.

## Synchronous Mode Communication Protocol

In this mode, the client-side application sends a request to the Beckn Protocol Server and waits for the response.

### Request Format in Synchronous Mode

All the request needs to follow the Beckn Protocol. As per the Beckn Protocol, each request consists of the following:

1. Context: The context of the request. The context should consist of the following

- domain

- core_version
- action

In case of non-search calls, the context must consist of the following:

- bpp_id
- bpp_url

All other fields are optional. In case not provided the default value configured with the Beckn Protocol Server will be used.

`NOTE`: The message_id will be overridden by the Beckn Protocol Server and a new message_id will be generated with each request.

Example:

```json
{
  "context": {
    "domain": "nic500112",
    "action": "search",
    "core_version": "0.9.3`",
    "bpp_id": "bpp_id",
    "bpp_url": "http://bpp_url"
  }
}
```

2. Message: The message representing the request. Every request should have a message. The message should follow the Beckn Protocol as well as the configured Open API Specification.

### Response Format in Synchronous Mode

As per the Beckn Protocol, each request can have multiple responses depending upon the action. So, all the responses received from the Beckn Network Participants will be returned in the same session.

The returned response will consist of the following:

1. Context: The context of the corresponding request. It will consist of the generated message_id and transaction_id with all the other fields provided in the corresponding request.

Example:

```json
{
  "context": {
    "domain": "nic500112",
    "core_version": "1.0.0",
    "action": "search",

    "bpp_id": "bpp_id",
    "bpp_uri": "bpp_uri",

    "message_id": "uuid",
    "transaction_id": "uuid"
  }
}
```

2. Responses: The responses received from the Beckn Network Participants will be aggregated and returned as an array of responses with the corresponding request context.

Example:

```json
{
  "responses": [
    {
      "context": {},
      "message": {}
    },
    {
      "context": {},
      "message": {}
    }
  ]
}
```

3. Error: The error object will be present in case the request fails. Each request will go through validation and if the request fails, the error object will be returned.

- type:The type of the error. The allowed values are CONTEXT-ERROR, CORE-ERROR, DOMAIN-ERROR, POLICY-ERROR and JSON-SCHEMA-ERROR
- code: Beckn specific error code. For a full list of error codes, refer to error_codes.md in the root folder of this repository.

## Asynchronous Mode Communication Protocol

In Asynchronous mode, the client-side application sends a request to the Beckn Protocol Server and does not wait for the response. The response will be delivered to the client-side application using a webhook or a message queue.

In the case of BPP Mode, the request will be sent asynchronously from the Beckn Protocol Server to the client-side application. The corresponding response needs to be delivered from the client-side application using a webhook or a message queue to the Beckn Protocol Server.

### Request Format in Asynchronous Mode

The request even in asynchronous mode will be similar to the request format in synchronous mode. Please refer to the Request Format in Synchronous Mode.

### Response Format in Asynchronous Mode

The response format for the asynchronous mode will completely follow the Beckn Protocol. Each response needs to be valid as Beckn Protocol and the configured Open API Specification.

### Acknowledgement Format in Asynchronous Mode

The acknowledgement provided by the Beckn Protocol Server to the client-side application is described below:

1. Context: The context of the acknowledgement. It will consist of the generated message_id and transaction_id with all the other fields.

Example:

```json
{
  "context": {
    "domain": "nic500112",
    "core_version": "1.0.0",
    "action": "search",

    "bpp_id": "bpp_id",
    "bpp_uri": "bpp_uri"
    "message_id": "uuid",
  	"transaction_id": "uuid"
  }
}
```

2. Message: The message representing acknowledgement. message.ack.status will provide ACK or NACK depending upon the acknowledgement.

Example:

```json
{
  "message": {
    "ack": {
      "status": "ACK"
    }
  }
}
```

3. Error: The error object will be present in case the request fails. Each request will go through validation and if the request fails, the error object will be returned.

- type:The type of the error. The allowed values are CONTEXT-ERROR, CORE-ERROR, DOMAIN-ERROR, POLICY-ERROR and JSON-SCHEMA-ERROR
- code: Beckn specific error code. For a full list of error codes, refer to error_codes.md in the root folder of this repository.
