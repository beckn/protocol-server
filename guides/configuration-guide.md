# _Configuration Guide_

This is the configuration guide for Beckn Protocol Server. With the help of this guide, you will be able to configure the Beckn Protocol Server either with Docker or Node.js. Each of the following sections will help you to configure the Beckn Protocol Server in different modes.

## _Application Modes_

        1.         *BAP Mode:* Beckn Application Platform (BAP) acquire consumers and place orders. The Beckn Protocol Server in BAP Mode helps the Application to be a part of the network as BAP.


        2.         *BPP Mode:* Beckn Protocol Platform (BPP) acquire orders and fulfils them. The Beckn Protocol Server in BPP Mode helps the Application to be a part of the network as BPP.

## _Gateway Modes_

        1.         *Client-Side Gateway:* The Client-Side Gateway is a gateway that is used by the Application to communicate with the Beckn Protocol Server.


        2.         *Network-Side Gateway:* The Network-Side Gateway is a gateway that is used by the Beckn Protocol Server to communicate with the Beckn Network.

## _Configuration Sections_

The whole configuration is broadly divided into three five sections:

        1.         *Server Configuration*: This section contains the HTTP server configuration for the protocol server.


        2.         *Cache Configuration*: This section contains the cache configuration for the protocol server.


        3.         *Response Cache Configuration*: This section contains the response cache configuration for the protocol server. It is an optional section.


        4.         *Client Configuration*: This section contains the client configuration for the protocol server. The mode of communication between the server is defined in this section.


        5.         *Application Configuration*: This section contains the application configuration for the protocol server. The mode of the protocol server and the participant details are configured in this section.

## _Server Configuration_

This section contains the HTTP server configuration for the protocol server. The HTTP server is used to communicate with the Beckn Network. In order to configure the HTTP server, the following parameters are required:

        •          port: The port number of the HTTP server.


                     port: 8000

### _Server Configuration Example_

server:

    port: 8000

## _Cache Configuration_

This section contains the cache configuration for the protocol server. The cache is used to store the request details and the registry lookup responses from the Beckn Network. In order to configure the cache, the following parameters are required:

        •          host: The hostname of the cache server.


                     host: cache-server


        •          port: The port number of the cache server.


                     port: 6379


        •          ttl: The time to live of the cache. It needs to be in ISO Duration format.


                     ttl: "PT10M"


        •          db: The database of the cache. It’s a number that is by default set to 0.


                     db: 5


                     In this case db 51 will be used for lookup cache and db 52 will be used for request cache.

### _Cache Configuration Example_

cache:

    host: cache-server

    port: 6379

    ttl: "PT10M"

    db: 5

## _Response Cache Configuration_

This section contains the response cache configuration for the protocol server. The response cache is used to store the responses from the Beckn Network. In order to configure the response cache, the following parameters are required:

        •          mongoURL: The URL of the MongoDB server with the database name.


                     mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"


        •          ttl: The time to live of the cache. It needs to be in ISO Duration format.


                     ttl: "PT10M"

### _Response Cache Configuration Example_

responseCache:

    mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"

    ttl: "PT10M"

## _Client Configuration_

This section contains the client configuration for the protocol server. The Beckn Protocol Server provides three modes of communication between the server and the client.

        1.         *Synchronous*: The client communicates with the Beckn Protocol Server through synchronous API calls. All the responses from the Beckn Network are returned to the client during the same session. (Not available for BPP mode.)


        2.         *Webhhook*: The client communicates with the Beckn Protocol Server through webhooks. The client can subscribe to the webhooks and receive the responses from the Beckn Network. All the requests or responses from the Beckn Network are sent to the client through webhooks.


        3.         *Message Queue*: The client communicates with the Beckn Protocol Server through a message queue. The client can subscribe to the message queue and receive the responses from the Beckn Network. All the requests or responses from the Beckn Network are sent to the client through the message queue.

_Note_: In case more than one mode of communication is configured, then the mode of communication will be decided based on this priority order.

        1.         Synchronous


        2.         Webhook


        3.         Message Queue

### _Synchronous Mode Configuration_

In the case of BAP Mode, all the requests from the client are sent to the Beckn Network and the responses are returned to the client in the same session. Completely synchronous API calls are made from the Client-Side Application and the responses are returned to the Client-Side Application. For Synchronous Mode the Beckn Protocol Server requires Mongo DB for caching. The following parameters are required:

        •          mongoURL: The URL of the MongoDB server with the database name.


                     mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"

### _Synchronous Mode Configuration Example_

client:

    synchronous:

    	mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"

### _Webhook Mode Configuration_

This section contains the webhook configuration for the protocol server. Webhooks are used to communicate with the Beckn Network. In order to configure the webhooks, the following parameters are required:

        •          url: The URL of the webhook. All the requests and responses from the Beckn Network are sent to the webhook configured in this URL.


                     url: "http://&lt;host>:&lt;port>/&lt;path>"

### _Webhook Mode Configuration Example_

client:

    webhook:

    	url: "http://&lt;host>:&lt;port>/&lt;path>"

### _Message Queue Mode Configuration_

This section contains the message queue configuration for the protocol server. The client communicates with the Beckn Protocol Server through a message queue. The client can subscribe to the message queue and receive the responses from the Beckn Network. All the requests or responses from the Beckn Network are sent to the client through the message queue. Message queue configuration is required to be configured in the following parameters:

        •          amqpURL: The URL of the AMQP server.


                     amqpURL: "amqp://&lt;username>:&lt;password>@&lt;host>:&lt;port>"


        •          incoming-queue: The name of the incoming queue. All the requests or responses from the client need to be published in the incoming-queue. The protocol server will be listening to the incoming-queue and will receive and then process the requests and the responses from the client.


                     incoming-queue: "incoming-queue"


        •          outgoing-queue: The name of the outgoing queue. All the requests or responses from the Beckn Network will be published to the outgoing-queue by the protocol server. The client application needs to be listening to the outgoing-queue in order to receive the requests or responses from the Beckn Network.


                     outgoing-queue: "outgoing-queue"

### _Message Queue Mode Configuration Example_

client:

    messageQueue:

    	amqpURL: "amqp://&lt;username>:&lt;password>@&lt;host>:&lt;port>"

    	incoming-queue: "incoming-queue"

    	outgoing-queue: "outgoing-queue"

## _Application Configuration_

This section contains the application configuration for the protocol server. This is a very important section as it configures the whole protocol server’s application behaviour.

### _Application Mode Configuration_

The four modes can be defined as follows:

        1.         Client-Side Gateway for BAP


        2.         Network-Side Gateway for BAP


        3.         Client-Side Gateway for BPP


        4.         Network-Side Gateway for BPP

Configuration of the application mode is required to be configured in the following parameters:

        •          mode: The mode of the adaptor. It can be either bap or bpp.


                     mode: bap


        •          gateway: The mode of the gateway. It can be either client or network.


                     gateway:


        	mode: client

### _Protocol Server Gateway Configuration_

The protocol server gateway communication configuration is required to be configured in the following parameters:

        •          mode: The mode of the gateway. It can be either client or network.


                     mode: client


        •          inbox-queue: The name of the inbox queue. The client-side gateway will be listening to the inbox-queue and will receive the requests or responses from the network-side gateway.


                     inbox-queue: "inbox"


        •          outbox-queue: The name of the outbox queue. The network-side gateway will be listening to the outbox-queue and will receive the requests or responses from the client-side gateway.


                     outbox-queue: "outbox"

### _Protocol Server Gateway Configuration Example_

gateway:

    mode: client

    inbox-queue: "inbox"

    outbox-queue: "outbox"

### _Actions Configuration_

The Beckn Protocol Server provides a set of actions that are divided into two categories:

        1.         *Request Actions*: These are the actions that are used to send requests to the Beckn Network.


        2.         *Response Actions*: These are the actions that are used to send responses to the client.

Configuration of actions is done in two sections one for requests and one for responses.

#### _Request Actions Configuration Example_

actions:

    requests:

    	search:

            ttl: "PT10S"

    	init:

            ttl: "PT10S"

#### _Response Actions Configuration Example_

actions:

    responses:

    	on_search:

            ttl: "PT10S"

    	on_init:

            ttl: "PT10S"

### _Action Configuration Example_

actions:

    requests:

    	search:

            ttl: "PT10S"

    	init:

            ttl: "PT10S"

    responses:

    	on_search:

            ttl: "PT10S"

    	on_init:

            ttl: "PT10S"

### _Network Participant Detail Configuration_

In order to communicate with the Beckn Network, the Beckn Protocol Server needs to know the details of the network participant. The following parameters are required:

        •          privateKey: The private key of the network participant.


                     privateKey: "&lt;private-key>"


        •          publicKey: The public key of the network participant.


                     publicKey: "&lt;public-key>"


        •          subscriberId: The subscriber id of the network participant.


                     subscriberId: "&lt;subscriber-id>"


        •          subscriberUri: The subscriber uri of the network participant.


                     subscriberUri: "&lt;subscriber-uri>"


        •          registryUrl: The registry url of the Beckn network.


                     registryUrl: "&lt;registry-url>"


        •          auth: The authentication flag. Used to enable or disable the authentication.


                     auth: true


        •          uniqueKey: The unique key of the network participant.


                     uniqueKey: "&lt;unique-key>"


        •          city: The default city of the network participant.


                     city: "std:080"


        •          country: The default country of the network participant.


                     country: "IND"


        •          httpTimeout: The timeout for the HTTP request.


                     httpTimeout: "PT10S"


        •          httpRetryCount: The retry count for the HTTP request.


                     httpRetryCount: 3

### _Network Participant Detail Configuration Example_

privateKey: "&lt;private-key>"

publicKey: "&lt;public-key>"

subscriberId: "&lt;subscriber-id>"

subscriberUri: "&lt;subscriber-uri>"

registryUrl: "&lt;registry-url>"

auth: true

uniqueKey: "&lt;unique-key>"

city: "std:080"

country: "IND"

httpTimeout: "PT10S"

httpRetryCount: 3

### _Application Configuration Example_

app:

    mode: bap

    gateway:

    	mode: client

    	inbox-queue: "inbox"

    	outbox-queue: "outbox"



    actions:

    	requests:

            search:

                ttl: "PT10S"

            init:

                ttl: "PT10S"

    	responses:

            on_search:

                ttl: "PT10S"

            on_init:

                ttl: "PT10S"



    privateKey: "&lt;private-key>"

    publicKey: "&lt;public-key>"

    subscriberId: "&lt;subscriber-id>"

    subscriberUri: "&lt;subscriber-uri>"



    registryUrl: "&lt;registry-url>"

    auth: true

    uniqueKey: "&lt;unique-key>"



    city: "std:080"

    country: "IND"



    httpTimeout: "PT3S"

    httpRetryCount: 3

## _Configuration Example_

server:

    port : 8080

cache:

    host: cache-server

    port: 6379

    ttl: "PT10M"

    db: 5

responseCache:

    mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"

    ttl: "PT10M"

client:

    synchronous:

    	mongoURL: "mongodb://&lt;username>:&lt;password>@&lt;host>:&lt;port>/&lt;database-name>?authSource=admin"

app:

    mode: bap

    gateway:

    	mode: client

    	inbox-queue: "inbox"

    	outbox-queue: "outbox"



    actions:

    	requests:

            search:

                ttl: "PT10S"

            init:

                ttl: "PT10S"

    	responses:

            on_search:

                ttl: "PT10S"

            on_init:

                ttl: "PT10S"



    privateKey: "&lt;private-key>"

    publicKey: "&lt;public-key>"

    subscriberId: "&lt;subscriber-id>"

    subscriberUri: "&lt;subscriber-uri>"



    registryUrl: "&lt;registry-url>"

    auth: true

    uniqueKey: "&lt;unique-key>"



    city: "std:080"

    country: "IND"



    httpTimeout: "PT3S"

    httpRetryCount: 3

## _Docker Configuration_

This section contains the docker configuration for the protocol server. This helps in configuring the protocol server to run in a docker container.

The Docker Image is available at[ becknfoundation/protocol-server](https://hub.docker.com/r/becknfoundation/protocol-server/).

Beckn Open API Schema and the Configuration file need to be provided using docker volume mount.

volumes:

    - ./openapi.yaml:/schemas/openapi.yaml

    - ./config.yaml:./config/default.yaml

OR

docker run -it -v ./openapi.yaml:/schemas/openapi.yaml -v ./config.yaml:./config/default.yaml becknfoundation/protocol-server

### _Configuration for Docker Compose_

version: "3"

    services:

    	protocol-server:

            image: becknfoundation/protocol-server

            ports:

                - "8080:8080"

            volumes:

                - ./openapi.yaml:/schemas/openapi.yaml

                - ./config.yaml:./config/default.yaml

### _Running through CLI_

docker run -it -v ./openapi.yaml:/schemas/openapi.yaml -v ./config.yaml:./config/default.yaml -p 8080:8080 becknfoundation/protocol-server

## _OpenAPI Schema Validator Configuration_

As the Beckn Protocol Server is a REST API, it needs to be validated against the OpenAPI schema. The validator requires a openapi.yaml file to be provided.
