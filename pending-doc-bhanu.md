# Introduction
The Beckn Protocol Server is a service that helps applications in connecting to the Beckn Network. It follows the Beckn Protocol, making it easier for applications to begin using Beckn Protocol. Any network participant can run this server and connect with the Beckn Network.

# Architecture

![image](https://github.com/beckn/protocol-server/assets/126443511/af9093a8-14d5-4d9d-a13d-c2bdfc267d78)

# Parts of Protocol Server - Client/Network and Webhook in Case of BPP

## Client and Network Roles

There are two instances of the Protocol Server running: one for the client side and the other for the network side.

## BAP Scenario

### Client-Facing Protocol Server

This server manages context building, validates request bodies based on the Standard Beckn Open API schema, listens to the Message Queue, aggregates results in Synchronous mode, and forwards the results to the client-side application as a webhook callback.

### Network-Facing Protocol Server

This server forwards requests to the respective Participant or Beckn Gateway (BG). It validates incoming requests from Participants & BG according to the Standard Beckn Open API schema and verifies the signature sent from clients to ensure data integrity.

## BPP Scenario

### Client-Facing Protocol Server

This server listens to the Message Queue, forwards requests to the client-side application, exposes an endpoint for the client-side application to send results to the network. The received data is validated against the Standard Beckn Open API schema and pushed to the network-facing Protocol Server.

### Network-Facing Protocol Server

This server listens to the Message Queue, forwards requests to the respective Participant or BG, and validates incoming requests from Participants & BG based on the Standard Beckn Open API schema. It also verifies the signature sent from clients to ensure data integrity.

# Use of Protocol Server

The Protocol Server is the application that facilitates interaction between BAP and BPP with the network. Besides network interaction, it also validates network participants and keeps track of requests and responses made to the network or any network participant.

# Requirements

To run the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) version 16 or above
- [npm](https://www.npmjs.com/) version 8 or above
- [MongoDB](https://www.mongodb.com/) version 4.4 or above
- [RabbitMQ](https://www.rabbitmq.com/) version 3.8 or above
- [Redis](https://redis.io/) version 6.2 or above

*(Optional)*

- [Docker](https://www.docker.com/) version 20.10 or above

**Note:** It's recommended to set up Docker Desktop to use docker-compose for development environments (Windows/Mac). We suggest configuring MongoDB, RabbitMQ, and Redis using Docker.

## Steps using Docker :

1. Clone the repository.
2. Navigate to the "protocol-server" directory.
3. Run the command `sh setup.sh`.
4. Go back to the home directory where you'll find a "docker-data" directory.
5. Enter the "docker-data" directory and locate the "docker-compose" file, which aids in deploying MongoDB, RabbitMQ, and Redis containers.
6. Modify the variables according to your needs (Note: these should be set in default.yaml files).
7. Execute `docker-compose up -d` to start the MongoDB, RabbitMQ, and Redis containers.


# Protocol Server Setup Guide 

## Cloning the GitHub Repository

Since the Protocol Server repository is public, you can clone it and switch to the main branch using the following commands:

```
git clone https://github.com/beckn/protocol-server.git
cd protocol-server
git checkout master
``` 

## Installing Node.js and npm using nvm (Ubuntu Machine) 
```bash 
sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install node
nvm install 16
nvm use 16
nvm alias default 16
node --version
npm --version
```

# Docker Installation for RabbitMQ, MongoDB & Redis Deployment using docker-compose

## Installing Docker and Docker-Compose

To install Docker and Docker-Compose, follow these steps:

```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo docker --version && docker-compose --version
sudo usermod -aG docker $USER
newgrp docker
```

## Deploying MongoDB, RabbitMQ, and Redis Containers using Docker Compose

In the "docker-data" directory, you'll find a "docker-compose" file facilitating the deployment of MongoDB, RabbitMQ, and Redis containers. Customize the variables as needed (Note: set these in the default.yaml files).

```bash
cd ~  # or go to the directory where you cloned the protocol-server repo.
cd protocol-server
sh setup.sh
cd ~  # go back to the home directory where you find a docker-data directory.
cd docker-data

docker-compose up -d  # execute to start the MongoDB, RabbitMQ, Redis containers
docker ps  # check running containers (MongoDB, RabbitMQ, Redis)
```

# Protocol Server Setup Guide for BAP/BPP

## Installing Protocol Server

Setting up the Protocol Server involves installing the necessary dependencies and building the project since it is written in TypeScript.

```bash
cd protocol-server
npm i
npm run build
```

## Key-Pair Generation
The Beckn Protocol Server provides key generation scripts for network participants. Follow these steps after completing the installation:

```bash
npm run generate-keys
```
Sample Output:

``` vbnet
Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==
```
**Note**: Ensure that the installation steps above are completed before generating key pairs. Save your keys in a secure location.

# Protocol Server Setup for BAP & BPP (Client & Network) - Docker-based Setup on Cloud

We tested this setup on an Ubuntu machine, and root access is required.

## System Preparation

Ensure your operating system is up-to-date by following the steps for updating the OS. For setting up Docker and Docker-Compose, refer to the instructions in the section titled "Installation of Docker for RabbitMQ, MongoDB & Redis deployment using docker-compose."

```bash
cd ~  # Takes you to your home directory where protocol-server and other YAML files are present.
``` 
Follow these steps to set up the Protocol Server for both BAP and BPP (Client & Network) using a Docker-based setup on the cloud.

# Configuring BAP Client and BAP Network

To deploy the BAP Client and BAP Network codebases, update the `~/dfault-bap-client.yml` and `~/dfault-bap-network.yml` files with the following values:

- **Port:** Enter the port where you want to run your application.

- **Cache:** Change the host and port where your Redis is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.

- **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file.

- **Private Key:** Copy the private key generated in the Key-Pair Generation step.

- **Public Key:** Copy the public key generated in the Key-Pair Generation step.

- **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.

- **Subscriber Uri:** Copy the subscriberUri from the Registry entry.

- **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).

# Configuring BPP Client and BPP Network

For the BPP Client and BPP Network codebases, update the `~/dfault-bpp-client.yml` and `~/dfault-bpp-network.yml` files with the following values:

- **Port:** Enter the port where you want to run your application.

- **Cache:** Change the host and port where your Redis is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.

- **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file.

- **Private Key:** Copy the private key generated in the Key-Pair Generation step.

- **Public Key:** Copy the public key generated in the Key-Pair Generation step.

- **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.

- **Subscriber Uri:** Copy the subscriberUri from the Registry entry.

- **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).

- **Webhook URL:** Copy and paste the URL generated by running localtunnel for sandbox-webhook.


## Setting up Nginx in Cloud (Ubuntu)

### Step-by-Step Guide

1. Update your system: `sudo apt update`.
2. Install Nginx: `sudo apt-get install nginx -y`.
3. Navigate to the Nginx configuration directory: `cd /etc/nginx/conf.d`.
4. Create a new configuration file: `sudo nano {enter-any-name.conf}`. Enter the configuration to map your DNS with the port.

#### Example Configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.domain.com;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://localhost:port;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.domain.com;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://localhost:port;
    }

    ssl_certificate /etc/letsencrypt/live/example.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.domain.com/privkey.pem;

    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE- 
    ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=63072000" always;

    ssl_stapling on;
    ssl_stapling_verify on;

    resolver 8.8.8.8;
}
```
Replace `example.domain.com` and `port` with your desired values in multiple places.

Obtain an SSL certificate for your domain and configure it on your machine.


# Registering on BECKN Registry

To register on the BECKN Registry, follow these steps:

1. Access the [Registry URL](https://registry.becknprotocol.io/login).

2. Log in using your Gmail ID.

## Create Network Participants:

- In the Registry, go to the admin tab and choose "**Network Participant.**"

- Click the **"+"** icon to create entries for both the BAP and BPP networks.

- Enter ParticipantIDs for each network, for BAP Network and BPP Network. (Note: We will refer to these as "subscriberIDs" going forward.)

## Configure Network Roles:

- Edit the created entries for BAP and BPP networks.

- Select the "Network Role Tab."

- Choose the network domain (leave it blank for universal BAP/BPP).

- Set the Type as "BAP" for the BAP network and "BPP" for the BPP network.

- Enter the respective "SubscriberID" created in the previous step (Create Network Participants).

- Set the Status field to "subscribed."

## Update Registry URLs:

- Copy the generated URLs and paste them in the URL field on the respective network role tab in the Registry.

- Save the changes.

## Configure Participant Keys:

- In the Registry, go to the participant key tab for both BAP and BPP networks.

- Click the "+" icon to add a participant key entry.

- Provide a key (used as uniqueKey in default.yml).

- Copy the generated public keys from the Key-Pair Generation step and paste them in the "Signing Public Key" and "Encryption Public Key" fields.

- Set the Valid from date to the current date and the Valid until date to a date at least one year ahead.

- Check the "Verified" checkbox and save the entry.

# Running Protocol Server

## Docker Deployment

To deploy using Docker, follow these steps:

1. Update the port number inside the `deploy-bap.sh` and `deploy-bpp.sh` mentioned in the `default.yml` file.
   
2. Execute `~/deploy-bap.sh` to deploy the BAP Client and Network.

3. Execute `~/deploy-bpp.sh` to deploy the BPP Client and Network.

## PM2 Deployment

For PM2 deployment, clone the protocol-server repository four times to set up the BAP Client, BAP Network, BPP Client, and BPP Network. 

Copy `~/dfault-bap-client.yml` and `~/dfault-bap-network.yml` to the config directory in the respective git clone directory of BAP Client and Network.

Also, copy `~/dfault-bpp-client.yml` and `~/dfault-bpp-network.yml` to the config directory in the respective git clone directory of BPP Client and Network.

After configuration, Protocol Server can be run as follows:

### To run the instance in Development Mode (For Debug Purposes):

```bash
npm run dev
```
## To run the instance in Production Mode:
```bash
npm i -g pm2
pm2 start ecosystem.config.js
```

## Recording on Steps to Set up Protocol Server using Docker:

[Video of Protocol Server - Local Setup](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/ETpBtz75kFhAg4pxXn0t8VYB5g_Y0lum6Ln7bGyjYlJSNQ?e=yT46uj&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)


**Note**: This setup is done on an Ubuntu server for setting up the protocol-server.
