# Introduction

The Beckn Protocol Server is a service that helps applications in connecting to the Beckn Network. It follows the Beckn Protocol, making it easier for applications to begin using Beckn Protocol. Any network participant can run this server and connect with the Beckn Network.

# Change Log
[Link to Change Log](change_log.md)

# Use of Protocol Server

The Protocol Server is the application that facilitates interaction between BAP and BPP with the network. Besides network interaction, it also validates network participants and keeps track of requests and responses made to the network or any network participant.

# Architecture

> Important : The Protocol Server is a reference application only. It is not indended to be used in production currently. To make this reference application adhere to current production standards, contributions are welcome.

![image](https://github.com/beckn/protocol-server/blob/devops/guides/images/general-architecture.png)

# Components of protocol server

In the case of BAP

1. Protocol server - Client-Facing
2. Protocol server - Network-Facing

In the case of BPP

1. Protocol server - Client-Facing
2. Protocol server - Network-Facing
3. Webhook

_**\* Client and Network run the same codebase. For running the protocol server in BAP or BPP mode only change needed is at the configuration level.\***_

## BAP Scenario

### Client-Facing Protocol Server

This server manages context building, validates request bodies based on the Standard Beckn Open API schema, listens to the Message Queue, aggregates results in Synchronous mode, and forwards the results to the client-side application as a webhook callback.

### Network-Facing Protocol Server

This server forwards requests to the respective Participant or Beckn Gateway (BG). It validates incoming requests from Participants & BG according to the Standard Beckn Open API schema and verifies the signature sent from clients to ensure data integrity.

### Asynchronous Mode Configuration

The BAP client supports two modes of operation: Synchronous and Asynchronous, but it can only run in one mode at a time. This section outlines the steps required to configure the BAP client to operate in Asynchronous Mode. In Asynchronous Mode, the BAP client immediately responds with an acknowledgment (ACK) after receiving a request. The actual responses from the BPP are then sent asynchronously via a configured webhook.

##### Configuration Steps

To enable **Asynchronous Mode** for the BAP client, follow the steps below:

1. **Locate the Configuration File**:
   - Open the `config/default.yaml` file in your BAP client setup.

2. **Set the Webhook URL**:
   - Under the `client` node in the YAML file, add the `webhook` node with the URL where the responses should be sent.
   
   Example configuration:
   ```yaml
   client:
     webhook: "https://your-webhook-url.com"
    ```

3. **Disable Synchronous mode**:
   - Remove or comment out the synchronous node under the client section in the default.yaml file.

4. **Save and Apply**:
    - Save the default.yaml file and restart server. The BAP client will now operate in asynchronous mode using the specified webhook for response delivery.


## BPP Scenario

### Client-Facing Protocol Server

This server listens to the Message Queue, forwards requests to the client-side application, exposes an endpoint for the client-side application to send results to the network. The received data is validated against the Standard Beckn Open API schema and pushed to the network-facing Protocol Server.

### Network-Facing Protocol Server

This server listens to the Message Queue, forwards requests to the respective Participant or BG, and validates incoming requests from Participants & BG based on the Standard Beckn Open API schema. It also verifies the signature sent from clients to ensure data integrity.

### Webhook

This is a Node.js application designed to function as an intermediary layer between the BPP client and the actual data source application. The application's workflow involves receiving requests from the BPP client, responding with an acknowledgment (ACK) to the BPP client, forwarding the original request to the actual data source application, receiving the response from the data source, and finally, initiating the reverse flow. The reverse flow includes triggering the 'on_action' routes of the BPP client, and the response then flows backward in the opposite direction.

[URL for Webhook-Sandbox](https://github.com/beckn/beckn-sandbox-webhook)

### Enabling HMAC Verification on BPP Client

To enable HMAC verification on the BPP client, follow these steps:

### Configuration

- Set `useHMACForWebhook` to `true` in the `default.yaml` configuration file.
- Set `sharedKeyForWebhookHMAC` to your shared key in the `default.yaml` configuration file. Ensure that the `sharedKeyForWebhookHMAC` is exactly 256 bits in length.

### HMAC Verification

- When HMAC verification is enabled and the configurations are set to valid values, the protocol server will include an authorization header containing the HMAC in its messages.
- The BPP client can then use the shared key to verify these messages.

### Example Configuration in `default.yaml`

```yaml
useHMACForWebhook: true
sharedKeyForWebhookHMAC: <YOUR_SHARED_KEY>
```

### Example HMAC

```
Message: {"context":{"domain":"retail","action":"search","bap_id":"retail.bap","bap_uri":"https://retail.bap.com","bpp_id":"retail.bpp","bpp_uri":"https://retail.bpp.com","version":"1.1.0","transaction_id":"51e0cce4-5a20-418b-9f10-797031f3b868","message_id":"829b9ab9-0f1b-4177-95a7-987ac1ed8caa"},"message":{"intent":{"item":{"descriptor":{"code":"assembly"}}}}}

Shared Key: juWDOTzzK7Eyrzm6hZwQmlJkolesm8x0

HMAC: HMAC-SHA-256 287662f35c63bb66710d96749ea87b5a8fa8073f919c8da628451a3c8567a1ff
```



# Prerequisites

To run the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) version 16 or above
- [npm](https://www.npmjs.com/) version 8 or above
- [MongoDB](https://www.mongodb.com/) version 4.4 or above
- [RabbitMQ](https://www.rabbitmq.com/) version 3.8 or above
- [Redis](https://redis.io/) version 6.2 or above

_(Optional)_

- [Docker](https://www.docker.com/) version 20.10 or above

**Note:** It's recommended to set up Docker Desktop to use docker-compose for development environments (Windows/Mac). We suggest configuring MongoDB, RabbitMQ, and Redis using Docker.

# Protocol Server Setup Guide

The protocol server can be set up in two env.

1. Local System (Dev env) - [Link to local-setup.md](https://github.com/beckn/protocol-server/blob/master/Local-Setup.md)
2. Production env - [Link to prod-setup.md](https://github.com/beckn/protocol-server/blob/master/Prod-Setup.md)

<br>
<br>

# FAQs:

### Q. What is the use of transaction ID and message ID in Beckn requests?.

<b>Ans:</b> The Message ID and Transaction ID are like special labels that help keep track of API calls and the different stages an order goes through.

<b>Transaction ID:</b> It is used both at the Beckn Application Platform (BAP) and Beckn Provider Platform (BPP) to keep an eye on and recognize the whole journey of an order.
<br>

<b>Message ID:</b> Is used to indentify a specific Becknified API calls during the order process. It is also used as a primary key in storing the response on the BAP side by keeping it in MongoDB, a dedicated system used for saving responses for fast retreival of data on the BAP side.
<br>
<br>

### Q. Are these IDs mandatory or optional? If mandatory, please specify the specific cases in which they are required.

<b>Ans:</b> These IDs are mandatory in the protocol server architecture. If you forget to provide them, the protocol server will create them on its own, use them to build the context object, and check the response.
<br>
<br>

### Q.What is the format of these IDs and how are they being used at the infra level i.e - Redis / MongoDB / RabbitMQ.

<b>Ans:</b> The IDs are strings. For message_id, it's important to be unique in each Beckn-specific API call to get new responses instead of cached ones. Meanwhile, transaction_id, used to identify the entire order lifecycle at the BAP or BPP level, can change in different order lifecycles. These IDs are created using the random_uuid npm package in the Protocol server and are used as a primary key to store every Beckn API response in the MongoDB.
