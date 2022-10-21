# Configuration Guide

With the help of this guide, you will be able to configure the Beckn Protocol Server to work in different modes.

## Usage Modes

- `BAP Mode:` Beckn Application Platform (BAP) acquire consumers and place orders. The Beckn Protocol Server in BAP Mode helps the Application to be a part of the network as BAP.
- `BPP Mode:` Beckn Protocol Platform (BPP) acquire orders and fulfils them. The Beckn Protocol Server in BPP Mode helps the Application to be a part of the network as BPP.

## Gateway Modes

- `Client-Side Gateway:` The Client-Side Gateway is a gateway that is used by the Application to communicate with the Beckn Protocol Server.
- `Network-Side Gateway:` The Network-Side Gateway is a gateway that is used by the Beckn Protocol Server to communicate with the Beckn Network.

## Configuration Sections

The whole configuration is broadly divided into three five sections:

- `Server Configuration:` This section contains the HTTP server configuration for the protocol server.
- `Cache Configuration:` This section contains the cache configuration for the protocol server.
- `Response Cache Configuration:` This section contains the response cache configuration for the protocol server. It is an optional section.
- `Client Configuration:` This section contains the client configuration for the protocol server. The mode of communication between the server is defined in this section.
- `Application Configuration:` This section contains the application configuration for the protocol server. The mode of the protocol server and the participant details are configured in this section.

## Server Configuration

This section contains the HTTP server configuration for the protocol server. The HTTP server is used to communicate with the Beckn Network. In order to configure the HTTP server, the following parameters are required:

- Port: The port on which the HTTP server will be listening for the incoming requests.
  Example: port: 8000

<!-- TODO: Add Example Server YAML here -->

## Cache Configuration

This section contains the cache configuration for the protocol server. The cache is used to store the request details and the registry lookup responses from the Beckn Network. In order to configure the cache, the following parameters are required:

- host: The hostname of the cache server.<br/> Example: host: 0.0.0.0
- port: The port on which the cache server is listening. <br/>Example: port: 6379
- ttl: The time to live of the cache. It needs to be in ISO Duration format.<br/>
  Example: ttl: "PT10M"
- db: The database of the cache. It’s a number that is by default set to 0.<br/>
  Example: db: 0 <br/>
  In this case db 51 will be used for lookup cache and db 52 will be used for request cache.

<!-- TODO: Add Example Cache YAML here -->

## Response Cache Configuration

This section contains the response cache configuration for the protocol server. The response cache is used to store the responses from the Beckn Network. In order to configure the response cache, the following parameters are required:

- mongoURL: The URL of the MongoDB server with the database name.<br/>mongoURL: "mongodb://<username>:<password>@<host>:<port>/<database-name>?authSource=admin"
- ttl: The time to live of the cache. It needs to be in ISO Duration format.<br/>
  Example: ttl: "PT10M"

<!-- TODO: Add Example Response Cache YAML here -->

## Client Configuration

This section contains the client configuration for the protocol server. The Beckn Protocol Server provides two modes of communication between the server and the client.

- `Synchronous:` This mode is used when the client wants the responses for the respective request in the same session. That is, the responses from the Beckn network will be sent as a response to the request that was sent to the Client Side Protocol Server. <br/> As Beckn network is completely asynchronous, this mode enables developers who face difficulty in developing asynchronous mechanisms in their app.
- `Webhook:` This mode is used when the client expects the responses as callbacks for the respective request.

**NOTE:** Do not use both the modes at the same time. The client will receive the responses in the same session only if the synchronous mode is enabled. If the synchronous mode is disabled, the client will receive the responses as callbacks.

### Synchronous Mode Configuration

In the case of BAP Mode, all the requests from the client are sent to the Beckn Network and the responses are returned to the client in the same session. Completely synchronous API calls are made from the Client-Side Application and the responses are returned to the Client-Side Application. For Synchronous Mode the Beckn Protocol Server requires Mongo DB for caching. The following parameters are required:

- mongoURL: The URL of the MongoDB server with the database name.

  Example: mongoURL: "mongodb://<username>:<password>@<host>:<port>/<database-name>?authSource=admin"

<!-- TODO: Add Example Synchronous Mode YAML here -->

### Webhook Mode Configuration

This section contains the webhook configuration for the protocol server. Webhooks are used to communicate with the Beckn Network. In order to configure the webhooks, the following parameters are required:

- url: The URL of the webhook. All the requests and responses from the Beckn Network are sent to the webhook configured in this URL.

  Example: url: "https://webhook.site/4f7e1b7a-1b1a-4b1a-8b1a-4f7e1b7a1b1a"
  <!-- TODO: Add Example Webhook Mode YAML here -->

## Application Configuration

This section contains the application configuration for the protocol server. This is a very important section as it configures the whole protocol server’s application behaviour.

### Application Mode Configuration

The four modes are as follows:

- Client-Side Gateway for BAP
- Client-Side Gateway for BPP
- Network-Side Gateway for BAP
- Network-Side Gateway for BPP

Configuration of the application mode is required to be configured in the following parameters:

- mode: The mode of the adaptor. It can be either bap or bpp.

  mode: bap

- gateway: The mode of the gateway. It can be either client or network.
  gateway. <br/>
  mode: client

## Protocol Server Gateway Configuration

The protocol server gateway communication configuration is required to be configured in the following parameters:

- mode: The mode of the adaptor. It can be either client or network.

  mode: client

- inbox-queue: The name of the inbox queue. The client-side gateway will be listening to the inbox-queue and will receive the requests or responses from the network-side gateway. <br/>

  inbox-queue: "inbox"

- outbox-queue: The name of the outbox queue. The network-side gateway will be listening to the outbox-queue and will receive the requests or responses from the client-side gateway.
  <br/>
  outbox-queue: "outbox"

  <!-- TODO: Add Example Protocol Server Gateway Configuration YAML here -->

## Actions Configuration

The Beckn Protocol Server provides a set of actions that are divided into two categories:

- Request Actions: These are the actions that are used to send requests to the Beckn Network.
- Response Actions: These are the actions that are used to send responses to the Beckn Network.<br/>

  Configuration of actions is done in two sections one for requests and one for responses.

<!-- TODO: Add Example Request Actions Configuration Example YAML here -->

<!-- TODO: Add Example Response Actions Configuration Example YAML here -->

## Network Participant Detail Configuration

In order to communicate with the Beckn Network, the Beckn Protocol Server needs to know the details of the network participant. The following parameters are required:

- privateKey: The private key of the network participant.

  Example:
  privateKey: "privateKey"

- publicKey: The public key of the network participant.

  Example:
  publicKey: "publicKey"

- subscriberId: The subscriber ID of the network participant.

  Example:
  subscriberId: "subscriberId"

- subscriberUri: The subscriber URI of the network participant.

  Example:
  subscriberUri: "subscriberUri"

- registryUrl: The registry URL of the Beckn Network.

  Example:
  registryUrl: "registryUrl"

- auth: The authentication flag. Used to enable or disable the authentication.

  Example:
  auth: true

- uniqueKey: The unique key of the network participant.

  Example:
  uniqueKey: "uniqueKey"

- city: The city of the network participant.

  Example:
  city: "std:080"

- country: The country of the network participant.

  Example:
  country: "IND"

- httpTimeout: The timeout for the HTTP request.

  Example:
  httpTimeout: "PT10S"

- httpRetryCount: The number of retries for the HTTP request.

  Example:
  httpRetryCount: 3

<!-- TODO: Add Example Network Participant Detail Configuration YAML here -->

<!-- TODO: Add Docker Configuration Steps here -->

<!-- TODO: Add OpenAPI Schema Configuration here -->
