# Protocol Server Installation Guide

Protocol Server requires the following services to be installed:

- [NodeJs](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.org/)
- [NPM](https://www.npmjs.com/)
- [Typescript](https://www.typescriptlang.org/)

## Configuring Protocol Server

Protocol Server uses the [configuration file](/config/default.yaml) to configure the server.

- [default.yaml](/config/default.yaml) needs to be present inside the [config](/config/) folder.

In order to create the configuration file you can refer to [config-sample.yml](/config/config-sample.yml).

## Basic Configuration

Protocol Server requires port number and db url to be configured.

```yaml
port: 3000
db: 
    url: mongodb://localhost:27017/protocol
```

- The port requires to be a valid integer number.The default port number is 3000.
- The db url requires to be a valid mongodb url.

## App Configuration

Protocol Server can be configured to run as a BAP(Beckn Application Platform) or as a BPP(Beckn Provider Platform).

All app configuration required to be inside the app object only.

### BAP Configuration

In order to configure the protocol server as BAP, you need to provide the following configuration:

1. Specify the app mode to be `bap`.

    ```yaml
    app:
        mode: bap
    ```

2. Specify the actions that this app will server.

    ```yaml
        actions:
            - search
            - init
    ```

3. Provide the sigin public key and private key

    ```yaml
        privateKey: "your private key"
        publicKey: "your public key"
    ```

4. Specify the `subscriberId` and `subscriberUri` as per the registry which is also known as `bap_id` and `bap_uri`.

    ```yaml
        subscriberId: "dev.bap.protocol-server.com"
        subscriberUri: "https://dev.bap.protocol-server.com/"
    ```

5. Specify the registry url.

    ```yaml
        registryUrl: https://registry.becknprotocol.io/subscribers
    ```

6. Specify whether to authenticate the requests or not. This can be done by providing the `auth` property.

    ```yaml
        auth: true
    ```

7. The unique key id is also required to in order to create authorization.

    ```yaml
        uniqueKey: "dev.bap.protocol-server.key"
    ```

8. Provide the Operation Region Information.

    ```yaml
        city: "std:080"
        country: "IND"
    ```

9. Provide the ttl for the requests and ttl for lookupCache.

    ```yaml
        ttl: "PT1M"
        lookupCacheTTL: "PT10S"
    ```

10. Provide the HTTP Configuration. The `httpTimeout` specify the timeout for the http requests in milliseconds. The `httpRetryCount` will specify the number of retries for the http requests.

    ```yaml
        httpTimeout: 5000
        httpRetryCount: 2
    ```

11. Provide the `clientUrl` in order to the communicate the responses to client.

    ```yaml
        clientUrl: "https://beckn.free.beeceptor.com/clientURL"
    ```

### BPP Configuration

In order to configure the protocol server as BPP, you need to provide the following configuration:

1. Specify the app mode to be `bpp`.

    ```yaml
    app:
        mode: bpp
    ```

2. Specify the actions that this app will server.

    ```yaml
        actions:
            - search
            - init
    ```

3. Provide the sigin public key and private key

    ```yaml
        privateKey: "your private key"
        publicKey: "your public key"
    ```

4. Specify the `subscriberId` and `subscriberUri` as per the registry which is also known as `bpp_id` and `bpp_uri`.

    ```yaml
        subscriberId: "dev.bpp.protocol-server.com"
        subscriberUri: "https://dev.bpp.protocol-server.com/"
    ```

5. Specify the registry url.

    ```yaml
        registryUrl: https://registry.becknprotocol.io/subscribers
    ```

6. Specify whether to authenticate the requests or not. This can be done by providing the `auth` property.

    ```yaml
        auth: true
    ```

7. The unique key id is also required to in order to create authorization.

    ```yaml
        uniqueKey: "dev.bpp.protocol-server.key"
    ```

8. Provide the Operation Region Information.

    ```yaml
        city: "std:080"
        country: "IND"
    ```

9. Provide the ttl for the requests and ttl for lookupCache.

    ```yaml
        ttl: "PT1M"
        lookupCacheTTL: "PT10S"
    ```

10. Provide the HTTP Configuration. The `httpTimeout` specify the timeout for the http requests in milliseconds. The `httpRetryCount` will specify the number of retries for the http requests.

    ```yaml
        httpTimeout: 5000
        httpRetryCount: 2
    ```

11. Provide the `clientUrl` in order to the communicate the responses to client which is a provider application in case of BPP.

    ```yaml
        clientUrl: "https://beckn.free.beeceptor.com/clientURL"
    ```

## Open API Schema Validation

In order to validate the API endpoint requests, responses and headers against the same endpoint spec in beckn protocols' specifications, you need to provide the required open api schema file [core.yaml](/schemas/core.yaml).

[core.yaml](/schemas/core.yaml) should be consisting of specification of each API as per the beckn protocol specifications.

- [core.yaml](/schemas/core.yaml) should be located inside the [schemas](/schemas/) folder.

## Installation

Once the whole protocol server is either configured to `BAP` or `BPP`, all npm packages needs to be installed.

```sh
npm install
```

## Running the server in Development Mode

Once all the packages are installed we can run the protocol server in development mode by using the following command.

```sh
npm run dev
```

## Building the Protocol Server

The whole server built on typescript so in order to run the server in production mode, we need to build the server in JS source code.

```sh
npm run build
```

All the JS source code will be located in the `dist` folder.

## Running the Protocol Server

Once the server is built, we can run the server in production mode by using the following command.

```sh
npm run start
```

## Using Docker Image

<!-- TODO: Sandeep please add docker docs from here -->

## Key generation Docs

To configure this protocol server, a pair of public and private keys is required. The private key is used to sign the requests and the public key is used to verify the requests. This public needs to be registered with the registry and the provided `uniqueKey` needs to be configured with the protocol server.

In order to generate the public and private keys, you need to run the following command.

```powershell
npm run generate-keys
```

This command will generate a pair of private and public and will be visible on the console.

### Output of Key Generation Script

```node
Generating Key Pairs...

Key Pairs Generated

Your Public Key : 
 taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :
 Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==

Please save your keys in a secure location.
```

## Network Subscription

To subscribe to Beckn network you can follow the network subscription docs [here](https://beckn-registry.readthedocs.io/en/latest/).

## Client Layer Implementation

### Prequestions

Knowledge of the Beckn network and [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications).

### Implementation Overview

Protocol server helps you connect with Beckn network and communicate with the Beckn network. So in order to communicate over the Beckn network each request needs to valid as per the [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications).

The protocol server will perform a series of validations on the request and will return the response as per the [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications).

Only the valid requests will be sent to the network. The invalid requests will be rejected.

It's necessary for all requests from the Client Layer to be valid as per the [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications).

Each request body is divided into three parts:

1. `context`: It consists of all the necessary information to validate and perform the request.
Each request from the client layer needs to have a `context` as part of the request with the following information:

    - `domain` : The domain of the request.

    - `core_version`: The version of the Beckn protocol.

    - `bpp_id`: This field is mandatory in the case of non-search calls.

    - `bpp_uri`: This field is mandatory in the case of non-search calls.

    The optional fields which will be provided configured value in case not provided.

    - `country`: This is an optional field and is used to specify the country of the request.

    - `city`: This is an optional field and is used to specify the city of the request.  

    - `transaction_id`: This is an optional field and is used to specify the transaction id of the request.

    The other fields which will be configured by the Protocol Server are:

    - `message_id`: This id will be generated by protocol server on request and is used to specify the message id of the request.

    - `ttl`: This will be configured by the protocol server as per the provided value in configuration file.

    - `timestamp`: This will be autogenerated at the time of request.

    - `bap_id`: This will be configured by the protocol server as per the provided value in configuration file.

    - `bap_uri`: This will be configured by the protocol server as per the provided value in configuration file.

    - `action`: This will be configured by the protocol depending on the request.

2. `message`: The message is the actual request body. It is the payload of the request. It needs to strictly follow the [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications). Any violation will lead to the request being rejected.

3. `error`: It is the error response in case of any error. It's an optional field. Refer to [Beckn Protocol Specifications](https://github.com/beckn/protocol-specifications).

### Steps

1. The client needs to implement a webhook in order to recieve the requests and responses from the protocol server.

    - The webhook needs to be configured with the `clientUrl` provided in the configuration file.

    - All the requests and responses recieved from the network will be sent to the webhook.

    - This API needs to be a `POST` api.

2. The communication from client layer to protocol server (BAP Mode) is through the HTTP webhooks. Each request will be sent as a `POST` request.
    Here the api path will be in the format.

    ```curl
    <protocol-server-host>/<action>
    ```

    Here the action can be one of the following:
    - `search`
    - `init`
    - `select`
    - `update`
    - `confirm`
    - `cancel`
    - `status`
    - `track`

3. In case when the protocol server is configured in BPP mode, each request from the network will be sent to the client layer as a `POST` request to the `clientUrl` provided in the configuration file. Once the request is processed the responses needs to be sent back to the protocol server.

    Here the api path will be in the format.

    ```curl
    <protocol-server-host>/<action>
    ```

    Here the action can be one of the following:
    - `on_search`
    - `on_init`
    - `on_select`
    - `on_update`
    - `on_confirm`
    - `on_cancel`
    - `on_status`
    - `on_track`

### Note

- `BAP Mode`: Each request from the client layer will be sent to the protocol server as a `POST` request. All the responses from the network will be sent to the client layer as a `POST` request to the `clientUrl` provided in the configuration file.

- `BPP Mode`: Each request from the network will be sent to the client layer as a `POST` request to the `clientUrl` provided in the configuration file. Once the request is processed the responses needs to be sent back to the protocol server as a `POST` request.
