# Protocol server (Setup and installation)

## Protocol Server BAP Client Setup
1. Clone the repo
```bash
git clone https://github.com/beckn/protocol-server.git protocol-server-bap-client
```
2. Go to cloned repo folder
```bash
cd protocol-server-bap-client
```
3. Switch to  branch 
```bash
git checkout v2-0.9.4-fix
```
4. Copy the config
```bash
cp config/config-sample-client-localhost.yaml config/default.yml
```
5. Do the following configuration in `config/default.yml` file
  - Configure the port on which protocol server bap client will listen
  ```yml
  server:
    port: 5001
  ```
  - Configure the Redis cache
  ```yml
  cache:
    host: "127.0.0.1"
    port: 6379
    ttl: "PT10M"
    # Optional. Default is 0.
    db: 1
  ```
  - Configure the `responseCache`'s `mongoURL` with working connection string
  ```yml
  responseCache:
    mongoURL: "mongodb://username:passwordd@127.0.0.1:27017/ps?authSource=admin"
  ```
  - Configure the `client`'s `mongoURL` with working connection string
  ```yml
  client:
    synchronous: 
      mongoURL: "mongodb://username:password@127.0.0.1:27017/ps?authSource=admin"
  ```
  - Keep `app`'s `mode` as `bap`
  ```yml
  # Mandatory.
  app:
  # Mandatory.
    mode: bap
  ```
  - Configure the `amqpURL` below. `amqpURL` refers to the `RabbitMQ` connection URI. keep `mode` as `client`
  ```yml
  # Two types of gateway mode present.
  # client and network.
  gateway:
    mode: client
    inboxQueue: "inbox"
    outboxQueue: "outbox"
    amqpURL: "amqp://username:password@127.0.0.1:5672"
  ```
  - Keep the `action` as below
  ```yml
  # Mandatory.
  actions:
    requests:
      search:
        ttl : "PT20S"
      init:
        ttl : "PT20S"
      select:
        ttl : "PT20S"
      confirm:
        ttl : "PT20S"
      status:
        ttl: "PT20S"
      track:
        ttl: "PT20S"
      support:
        ttl: "PT20S"
      update:
        ttl: "PT20S"
      cancel:
        ttl: "PT20S"
      rating:
        ttl: "PT20S"
      get_cancellation_reasons:  
        ttl: "PT20S"
      get_rating_categories:
        ttl: "PT20S"
      
    responses: 
      on_search:
        ttl: "PT20S"
      on_init:
        ttl: "PT20S"
      on_select:
        ttl: "PT20S"
      on_confirm:
        ttl: "PT20S"
      on_status:
        ttl: "PT20S"
      on_track:
        ttl: "PT20S"
      on_support:
        ttl: "PT20S"
      on_update:
        ttl: "PT20S"
      on_cancel:
        ttl: "PT20S"
      on_rating:
        ttl: "PT20S"
      cancellation_reasons:
        ttl: "PT20S"
      rating_categories:
        ttl: "PT20S"
  ```
  - You can run the command `npm run generate-keys` to generate `privateKey` and `publicKey` and put in below config
  ```yml
  # Mandatory.
  privateKey: "K+/Oo4ama1wditbhQTFYg9g6RoSR4GPDbrSszXh6giBqxGJWMgQdzbK7q6eB/6gdIcep/FRzx8DQGPw2OOFm3Q=="
  publicKey: "asRiVjIEHc2yu6ungf+oHSHHqfxUc8fA0Bj8NjjhZt0="
```

- Please find the `subscriberId` in `Participant Key` tab of `Network Participant` edit page of `Beckn Protocol Registry`. Also find the `subscriberUri` in `Network Role` tab of `Network Participant` edit page of `Beckn Protocol Registry` 
  ```yml
  # Mandatory.
  # Mandatory.
  subscriberId: "beckn-sandbox-bap.becknprotocol.io"
  subscriberUri: "https://e3dd-2409-4063-429d-613a-e975-c421-884f-ff31.ngrok-free.app"
```

  - Configure the `uniqueKey`. You can find the `uniqueKey` in `Participant Key` tab of `Network Participant` of `Beckn Protocol Registry`
  ```yml
  registryUrl: https://registry.becknprotocol.io/subscribers
  auth: false
  uniqueKey: "beckn-sandbox-bap-key.becknprotocol.io"
```
  - Keep below configuration as it is.
```yml
# Mandatory.
  city: "std:080"
  country: "IND"

  # Mandatory.
  ttl: "PT10M"

  # Mandatory.
  httpTimeout: "PT3S"
  httpRetryCount: 2
```

## Protocol Server BAP Network Setup
1. Clone the repo
```bash
git clone https://github.com/beckn/protocol-server.git protocol-server-bap-network
```
2. Go to cloned repo folder 
```bash
cd protocol-server-bap-network
```
3. Switch to branch 
```bash
git checkout v2-0.9.4-fix
```
4. Copy the config
```bash
cp config/config-sample-network-localhost.yaml config/default.yml
```
5. Do the following configuration in `config/default.yml` file
  - Configure the port on which bap protocol server network will listen
  ```yml
  server:
    port: 6002
  ```
  - Configure the Redis cache
  ```yml
  cache:
    host: "127.0.0.1"
    port: 6379
    ttl: "PT10M"
    # Optional. Default is 0.
    db: 1
  ```
  - Configure the `responseCache`'s `mongoURL` with working connection string
  ```yml
  responseCache:
    mongoURL: "mongodb://username:passwordd@127.0.0.1:27017/ps?authSource=admin"
  ```
  - Configure the `client`'s `mongoURL` with working connection string
  ```yml
  client:
    synchronous: 
      mongoURL: "mongodb://username:password@127.0.0.1:27017/ps?authSource=admin"
  ```
  - Keep `app`'s `mode` as `bap`
  ```yml
  # Mandatory.
  app:
  # Mandatory.
    mode: bap
  ```
  - Configure the `amqpURL` below. `amqpURL` refers to the `RabbitMQ` connection URI. Keep `mode` as `network`. `inboxQueue` and `outboxQueue` should be same as `Protocol Server BAP Client`'s `inboxQueue` and `outboxQueue`.
  ```yml
  # Two types of gateway mode present.
  # client and network.
  gateway:
    mode: network
    inboxQueue: "inbox"
    outboxQueue: "outbox"
    amqpURL: "amqp://username:password@127.0.0.1:5672"
  ```
  - Keep the `action` as below
  ```yml
  # Mandatory.
  actions:
    requests:
      search:
        ttl : "PT20S"
      init:
        ttl : "PT20S"
      select:
        ttl : "PT20S"
      confirm:
        ttl : "PT20S"
      status:
        ttl: "PT20S"
      track:
        ttl: "PT20S"
      support:
        ttl: "PT20S"
      update:
        ttl: "PT20S"
      cancel:
        ttl: "PT20S"
      rating:
        ttl: "PT20S"
      get_cancellation_reasons:  
        ttl: "PT20S"
      get_rating_categories:
        ttl: "PT20S"
      
    responses: 
      on_search:
        ttl: "PT20S"
      on_init:
        ttl: "PT20S"
      on_select:
        ttl: "PT20S"
      on_confirm:
        ttl: "PT20S"
      on_status:
        ttl: "PT20S"
      on_track:
        ttl: "PT20S"
      on_support:
        ttl: "PT20S"
      on_update:
        ttl: "PT20S"
      on_cancel:
        ttl: "PT20S"
      on_rating:
        ttl: "PT20S"
      cancellation_reasons:
        ttl: "PT20S"
      rating_categories:
        ttl: "PT20S"
  ```
  - Configure `privateKey` and `publicKey`. Get `privateKey` and `publicKey` from `protocol-server-bap-client/config/default.yml`
  ```yml
  # Mandatory.
  privateKey: "K+/Oo4ama1wditbhQTFYg9g6RoSR4GPDbrSszXh6giBqxGJWMgQdzbK7q6eB/6gdIcep/FRzx8DQGPw2OOFm3Q=="
  publicKey: "asRiVjIEHc2yu6ungf+oHSHHqfxUc8fA0Bj8NjjhZt0="
```
  - Configure the `uniqueKey`. You can find the `uniqueKey` in `Participant Key` tab of `Network Participant` of `Beckn Protocol Registry`
```yml
registryUrl: https://registry.becknprotocol.io/subscribers
auth: false
uniqueKey: "beckn-sandbox-bap-key.becknprotocol.io"
```
  - Keep below configuration as it is.
```yml
# Mandatory.
city: "std:080"
country: "IND"

# Mandatory.
ttl: "PT10M"

# Mandatory.
httpTimeout: "PT3S"
httpRetryCount: 2
```
6. Execute the command `npm run dev` to start the server.
7. Make the BAP Network server publicly accessible by using tools like [localtunnel](https://theboroer.github.io/localtunnel-www), [ngrok](https://ngrok.com/docs), [loophole](https://loophole.cloud/docs). This **public url** will be used in `config/default.yml` and `Beckn registry`.

## Protocol Server BPP Client Setup
1. Clone the repo
```bash
git clone https://github.com/beckn/protocol-server.git protocol-server-bpp-client
```
2. Go to cloned repo folder
```bash
cd protocol-server-bpp-client
```
3. Switch to branch
```bash
git checkout v2-0.9.4-fix
```
4. Copy the config
```bash
cp config/config-sample-client-localhost.yaml config/default.yml
```
5. Do the following configuration in `config/default.yml` file
  - Configure the port on which bpp protocol server client will listen
  ```yml
  server:
    port: 6001
  ```
  - Configure the Redis cache
  ```yml
  cache:
    host: "127.0.0.1"
    port: 6379
    ttl: "PT10M"
    # Optional. Default is 0.
    db: 1
  ```
  - Configure the `responseCache`'s `mongoURL` with working connection string. This has to use different database than bpp.
  ```yml
  responseCache:
    mongoURL: "mongodb://username:passwordd@127.0.0.1:27017/ps-bpp?authSource=admin"
  ```
  - Configure the `client`'s `mongoURL` with working connection string
  ```yml
  client:
    synchronous: 
      mongoURL: "mongodb://username:password@127.0.0.1:27017/ps-bpp?authSource=admin"
  ```
  - Keep `app`'s `mode` as `bpp`
  ```yml
  # Mandatory.
  app:
  # Mandatory.
    mode: bpp
  ```
  - Configure the `amqpURL` below. `amqpURL` refers to the `RabbitMQ` connection URI. Also keep `mode` as `client`. Also configure `inboxQueue` and `outboxQueue` as below.
  ```yml
  # Two types of gateway mode present.
  # client and network.
  gateway:
    mode: client
    inboxQueue: "inbox-bpp"
    outboxQueue: "outbox-bpp"
    amqpURL: "amqp://username:password@127.0.0.1:5672"
  ```
  - Keep the `action` as below
  ```yml
  # Mandatory.
  actions:
    requests:
      search:
        ttl : "PT20S"
      init:
        ttl : "PT20S"
      select:
        ttl : "PT20S"
      confirm:
        ttl : "PT20S"
      status:
        ttl: "PT20S"
      track:
        ttl: "PT20S"
      support:
        ttl: "PT20S"
      update:
        ttl: "PT20S"
      cancel:
        ttl: "PT20S"
      rating:
        ttl: "PT20S"
      get_cancellation_reasons:  
        ttl: "PT20S"
      get_rating_categories:
        ttl: "PT20S"
      
    responses: 
      on_search:
        ttl: "PT20S"
      on_init:
        ttl: "PT20S"
      on_select:
        ttl: "PT20S"
      on_confirm:
        ttl: "PT20S"
      on_status:
        ttl: "PT20S"
      on_track:
        ttl: "PT20S"
      on_support:
        ttl: "PT20S"
      on_update:
        ttl: "PT20S"
      on_cancel:
        ttl: "PT20S"
      on_rating:
        ttl: "PT20S"
      cancellation_reasons:
        ttl: "PT20S"
      rating_categories:
        ttl: "PT20S"
  ```
  - Run the command `npm run generate-keys` to generate `privateKey` and `publicKey` and put in below config
  ```yml
  # Mandatory.
  privateKey: "K+/Oo4ama1wditbhQTFYg9g6RoSR4GPDbrSszXh6giBqxGJWMgQdzbK7q6eB/6gdIcep/FRzx8DQGPw2OOFm3Q=="
  publicKey: "asRiVjIEHc2yu6ungf+oHSHHqfxUc8fA0Bj8NjjhZt0="
```
  - Configure the `uniqueKey`. You can find the `uniqueKey` in `Participant Key` tab of `Network Participant` of `Beckn Protocol Registry`
  ```yml
  registryUrl: https://registry.becknprotocol.io/subscribers
  auth: false
  uniqueKey: "beckn-sandbox-bpp-key.becknprotocol.io"
```
  - Keep below configuration as it is.
```yml
# Mandatory.
  city: "std:080"
  country: "IND"

  # Mandatory.
  ttl: "PT10M"

  # Mandatory.
  httpTimeout: "PT3S"
  httpRetryCount: 2
```

## Protocol Server BPP Network Setup
1. Clone the repo
```bash
git clone https://github.com/beckn/protocol-server.git protocol-server-bpp-network
```
2. Go to cloned repo folder
```bash
cd protocol-server-bap-network
```
3. Switch to branch 
```bash
git checkout v2-0.9.4-fix
```
4. Copy the config
```bash
cp config/config-sample-network-localhost.yaml config/default.yml
```
5. Do the following configuration in `config/default.yml` file
  - Configure the port on which protocol server bpp network will listen
  ```yml
  server:
    port: 6002
  ```
  - Configure the Redis cache
  ```yml
  cache:
    host: "127.0.0.1"
    port: 6379
    ttl: "PT10M"
    # Optional. Default is 0.
    db: 1
  ```
  - Configure the `responseCache`'s `mongoURL` with working connection string
  ```yml
  responseCache:
    mongoURL: "mongodb://username:passwordd@127.0.0.1:27017/ps?authSource=admin"
  ```
  - Configure the `client`'s `mongoURL` with working connection string
  ```yml
  client:
    synchronous: 
      mongoURL: "mongodb://username:password@127.0.0.1:27017/ps?authSource=admin"
  ```yml
  - Keep `app`'s `mode` as `bpp`
  ```
  # Mandatory.
  app:
  # Mandatory.
    mode: bpp
  ```yml
  - Configure the `amqpURL` below. `amqpURL` refers to the `RabbitMQ` connection URI. Keep `mode` as `network`. `inboxQueue` and `outboxQueue` should be same as `Protocol Server BPP Client`'s `inboxQueue` and `outboxQueue`.
  ```yml
  # Two types of gateway mode present.
  # client and network.
  gateway:
    mode: network
    inboxQueue: "inbox-bpp"
    outboxQueue: "outbox-bpp"
    amqpURL: "amqp://username:password@127.0.0.1:5672"
  ```yml
  - Keep the `action` as below
  ```yml
  # Mandatory.
  actions:
    requests:
      search:
        ttl : "PT20S"
      init:
        ttl : "PT20S"
      select:
        ttl : "PT20S"
      confirm:
        ttl : "PT20S"
      status:
        ttl: "PT20S"
      track:
        ttl: "PT20S"
      support:
        ttl: "PT20S"
      update:
        ttl: "PT20S"
      cancel:
        ttl: "PT20S"
      rating:
        ttl: "PT20S"
      get_cancellation_reasons:  
        ttl: "PT20S"
      get_rating_categories:
        ttl: "PT20S"
      
    responses: 
      on_search:
        ttl: "PT20S"
      on_init:
        ttl: "PT20S"
      on_select:
        ttl: "PT20S"
      on_confirm:
        ttl: "PT20S"
      on_status:
        ttl: "PT20S"
      on_track:
        ttl: "PT20S"
      on_support:
        ttl: "PT20S"
      on_update:
        ttl: "PT20S"
      on_cancel:
        ttl: "PT20S"
      on_rating:
        ttl: "PT20S"
      cancellation_reasons:
        ttl: "PT20S"
      rating_categories:
        ttl: "PT20S"
  ```
  - Configure `privateKey` and `publicKey`. Get `privateKey` and `publicKey` from `protocol-server-bpp-client/config/default.yml`
  ```yml
  # Mandatory.
  privateKey: "K+/Oo4ama1wditbhQTFYg9g6RoSR4GPDbrSszXh6giBqxGJWMgQdzbK7q6eB/6gdIcep/FRzx8DQGPw2OOFm3Q=="
  publicKey: "asRiVjIEHc2yu6ungf+oHSHHqfxUc8fA0Bj8NjjhZt0="
```
  - Configure the `uniqueKey`. You can find the `uniqueKey` in `Participant Key` tab of `Network Participant` of `Beckn Protocol Registry`
  ```yml
  registryUrl: https://registry.becknprotocol.io/subscribers
  auth: false
  uniqueKey: "beckn-sandbox-bap-key.becknprotocol.io"
```
  - Keep below configuration as it is.
```yml
# Mandatory.
  city: "std:080"
  country: "IND"

  # Mandatory.
  ttl: "PT10M"

  # Mandatory.
  httpTimeout: "PT3S"
  httpRetryCount: 2
```bash
6. Execute the command `npm run dev` to start the server.
7. Make the BPP Network server publicly accessible by using tools like [localtunnel](https://theboroer.github.io/localtunnel-www), [ngrok](https://ngrok.com/docs), [loophole](https://loophole.cloud/docs). This **public url** will be used in `config/default.yml` and `Beckn registry`.