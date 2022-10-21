# Beckn Protocol Server

## Introduction

### Overview

Beckn Protocol Server is a service that helps the application connect to Beckn Network. It follows the [Beckn Protocol](https://beckn.network/protocol) and makes it more accessible for the applications to get started with Beckn implementation. Any network participant can run this server and connect to Beckn Network.

### Features

- Connects a client application with the Beckn network.
- Acts as BAP Adaptor in case of Beckn Application Platform.
- Acts as BPP Adaptor in case of Beckn Provider Platform.
- Validates each request as per the Beckn Network’s Open API schema.
- Generates signatures for the outgoing requests and validates signatures for the incoming requests.
- Stores log for each process.
- Comes with key generation scripts for the Network participants.

## Architecture

![alt text](https://raw.githubusercontent.com/beckn/protocol-server/v2/guides/images/general-architecture.png?raw=true)

There would 2 instances of Protocol Server that is running. One is `Client` facing and the other is `Network` facing.

#### In the case of BAP

`Client` facing Protocol Server manages building the context, validating the request body as per the Standard Beckn Open API schema, listens to the Message Queue, Aggregates the results in the case of Synchronous mode and forwards the results to the client side application as a webhook callback.

`Network` facing Protocol Server manages forwarding the request to the respective Participant or Beckn Gateway (BG). Also it validates the incoming requests from Participants & BG as per the Standard Beckn Open API schema and then validates the signature sent from the clients to ensure the data integrity.

#### In the case of BPP

`Client` facing Protocol Server listens to the Message Queue and forwards the request to client side application, exposes an endpoint where the client side application can send the results to the network which is again validated against the Standard Beckn Open API schema and pushed to the network facing Protocol Server.

`Network` facing Protocol Server also listens to the Message Queue and forwards the request to the respective Participant or BG. Also it validates the incoming requests from Participants & BG as per the Standard Beckn Open API schema and then validates the signature sent from the clients to ensure the data integrity.

## Installation

### Requirements

- Node.js version 16 or above
- npm version 8 or above
- MongoDB version 4.4 or above
- RabbitMQ version 3.8 or above
- Redis version 6.2 or above

(Optional)

- Docker version 20.10 or above

Docker can be used to run the above services. An example docker-compose file is provided in docker/docker-compose.yaml

### Download

As the Protocol Server repository is Public, clone the repository and checkout to v2 branch.

```bash
git clone https://github.com/beckn/protocol-server.git
```

```bash
cd protocol-server
```

```bash
git checkout v2
```

### Install

Installation of the Protocol Server consists of installing the necessary dependencies and building the project as the project is written in TypeScript.

```bash
npm i
```

```bash
npm run build
```

### Configure

The configuration of Protocol Server is done in config/default.yaml file.

Sample configurations of the same can be found in config/samples for the different modes of running Protocol Server.

### Key-Pair Generation

Beckn Protocol Server comes with key generation scripts for the Network participants. You can use the scripts to generate the keys for the Network participants.

**NOTE:** To generate the key pairs, the above steps must be completed.

```bash
npm run generate-keys
```

#### Sample Output

```
Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==

Please save your keys in a secure location.
```

### Run

After configuration, Protocol Server can be run as below.

To run the instance in Development Mode (For Debug Purposes):

```bash
npm run dev
```

To run the instance in Production Mode:

```bash
npm i -g pm2
pm2 start ecosystem.config.js
```

**NOTE:** If the same server is used to host both the instances of Protocol Server, then make sure to edit the app name in ecosystem.config.js file as per the instance.

### License

This project is maintained under an MIT License
