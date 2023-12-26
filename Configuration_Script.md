# Protocol Server Configuration Script for Linux server

## Overview

This script is designed to facilitate the configuration of a protocol server using various sub-scripts for tasks such as Docker installation, Nginx setup, and more.

## How to Use

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/beckn/protocol-server.git
    ```

2. **Switch to the Devops Branch:**

    ```bash
    git checkout master
    ```

3. **Navigate to the Script Directory:**

    ```bash
    cd protocol-server
    ```

4. **Run the Configuration Script:**

    ```bash
    ./configure_protocol_server.sh [options]
    ```

    - Replace `[options]` with the desired parameters as explained below.

## How to Pass Parameters

The `configure_protocol_server.sh` script accepts the following parameters:

- `--bap_subscriber_id <value>`: Set the BAP subscriber ID (required).
- `--bap_subscriber_uri <value>`: Set the BAP subscriber URI (required).
- `--bpp_subscriber_id <value>`: Set the BPP subscriber ID (required if setting up on the same server).
- `--bpp_subscriber_uri <value>`: Set the BPP subscriber URI (required if setting up on the same server).
- `--registry_url <value>`: Set the registry URL without lookup (default: https://registry.becknprotocol.io/subscribers).
- `--mongouser <value>`: Set MongoDB username (default: beckn).
- `--mongopassword <value>`: Set MongoDB password (default: beckn123).
- `--mongodatabase <value>`: Set MongoDB database (default: protocol_server).
- `--rabbitmquser <value>`: Set RabbitMQ username (default: beckn).
- `--rabbitmqpassword <value>`: Set RabbitMQ password (default: beckn123).

For example:

```bash
./configure_protocol_server.sh --bap_subscriber_id my_bap_id --bap_subscriber_uri http://example.com/bap --registry_url http://example.com/registry
```
### `update_bap_config.sh`

The `update_bap_config.sh` script is designed to update the configuration files for a Beckn BAP (Buyer Agent Proxy) instance. It allows users to customize various parameters such as MongoDB settings, RabbitMQ configurations, network ports, and more.

## How to Use

1. **Navigate to the Script Directory:**

    ```bash
    cd protocol-server/scripts
    ```

2. **Run the BAP Configuration Script:**

    ```bash
    ./update_bap_config.sh [options]
    ```

    - Replace `[options]` with the desired parameters as explained below.

## How to Pass Parameters

The `update_bap_config.sh` script accepts the following parameters:

- `--mongo_initdb_root_username <value>`: MongoDB root username (default: beckn).
- `--mongo_initdb_root_password <value>`: MongoDB root password (default: beckn123).
- `--mongo_initdb_database <value>`: MongoDB database name (default: protocol_server).
- `--rabbitmq_default_user <value>`: RabbitMQ default username (default: beckn).
- `--rabbitmq_default_pass <value>`: RabbitMQ default password (default: beckn123).
- `--rabbitmqUrl <value>`: RabbitMQ URL (default: 0.0.0.0).
- `--private_key <value>`: Private key for encryption.
- `--public_key <value>`: Public key for encryption.
- `--subscriber_id <value>`: BAP subscriber ID (required).
- `--subscriber_url <value>`: BAP subscriber URL (required).
- `--subscriber_id_key <value>`: BAP subscriber ID key.

For example:

```bash
./update_bap_config.sh --mongo_initdb_root_username my_mongo_user --subscriber_id my_bap_id --subscriber_url http://example.com/bap
```

### `update_bpp_config.sh`

## Overview

The `update_bpp_config.sh` script is similar to the `update_bap_config.sh` script but is intended for updating the configuration files of a Beckn BPP (Business Partner Proxy) instance. It provides customization options for MongoDB settings, RabbitMQ configurations, network ports, and other parameters.

## How to Use

1. **Navigate to the Script Directory:**

    ```bash
    cd protocol-server/scripts
    ```

2. **Run the BPP Configuration Script:**

    ```bash
    ./update_bpp_config.sh [options]
    ```

    - Replace `[options]` with the desired parameters as explained below.

## How to Pass Parameters

The `update_bpp_config.sh` script accepts parameters similar to `update_bap_config.sh`:

- `--mongo_initdb_root_username <value>`: MongoDB root username (default: beckn).
- `--mongo_initdb_root_password <value>`: MongoDB root password (default: beckn123).
- `--mongo_initdb_database <value>`: MongoDB database name (default: protocol_server).
- `--rabbitmq_default_user <value>`: RabbitMQ default username (default: beckn).
- `--rabbitmq_default_pass <value>`: RabbitMQ default password (default: beckn123).
- `--rabbitmqUrl <value>`: RabbitMQ URL (default: 0.0.0.0).
- `--private_key <value>`: Private key for encryption.
- `--public_key <value>`: Public key for encryption.
- `--bpp_subscriber_id <value>`: BPP subscriber ID (required).
- `--bpp_subscriber_url <value>`: BPP subscriber URL (required).
- `--bpp_subscriber_id_key <value>`: BPP subscriber ID key.

For example:

```bash
./update_bpp_config.sh --bpp_subscriber_id example-bpp --bpp_subscriber_url http://example-bpp.com/bp
```
