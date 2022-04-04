# Protocol Server Installation Guide

Protocol Server requires the following services to be installed:

- [NodeJs](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.org/)
- [NPM](https://www.npmjs.com/)
- [Typescript](https://www.typescriptlang.org/)

## Configuring Protocol Server

Protocol Server uses the [configuration file](/config/default.yaml) to configure the server.

- [default.yaml](/config/default.yaml)

In order to create the configuration file you can use refer to [config-sample.yaml](/config/config-sample.yaml).

## Mandatory Configuration

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

### BAP Configuration

In order to configure the server as BAP, you need to provide the following information:
