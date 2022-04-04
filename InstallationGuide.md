# Protocol Server Installation Guide

Protocol Server requires the following services to be installed:

- [NodeJs](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.org/)
- [NPM](https://www.npmjs.com/)
- [Typescript](https://www.typescriptlang.org/)

## Configuring Protocol Server

Protocol Server uses the [configuration file](/config/default.yaml) to configure the server.

- [default.yaml](/config/default.yaml) needs to be present inside the [config](/config/) folder.

In order to create the configuration file you can use refer to [config-sample.yaml](/config/config-sample.yaml).

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
        ttl: "P1M"
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

4. Specify the `subscriberId` and `subscriberUri` as per the registry which is also known as `bpp_id` and `bpp_uri`.

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
        ttl: "P1M"
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
