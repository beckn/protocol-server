# Protocol Server Setup Guide for Production

#### Note: The following setup steps are for the Ubuntu Machine. 

## Table of contents:
**1. Installing prerequisites**
   1. Installing Node.js and npm using nvm (Ubuntu Machine)
   2. Docker Installation
    
**2. Installing Protocol-Server dependencies**
   1. Cloning the GitHub Repository
   2. Installing Protocol Server Dependencies
   3. Key-Pair Generation 
   4. Deploying MongoDB, RabbitMQ, and Redis Containers using Docker Compose (Ubuntu Machine)
      
**3. Exposing local Protocol-server to the Internet**
   1. Setting up LocalTunnel when there is no DNS Tools available.
   2. Nginx in the Production System (Ubuntu) if you have DNS Tools.
      
**4. Registering on BECKN Registry**
   1. Create Network Participants.
   2. Configure Network Roles.
   3. Update Registry URLs.
   4. Configure Participant Keys.
      
**5. Configuring BAP Client and BAP Network**

**6. Configuring BPP Client and BPP Network**

**7. Starting the Protocol Server**
   1. Docker Deployment
   2. PM2 Deployment
      
**8. Step-by-step videos to set up Protocol Server using Docker**
***
# Installing prerequisites

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

## Docker Installation


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


# Installing Protocol-Server dependencies

## Cloning the GitHub Repository

Since the Protocol Server repository is public, you can clone it and switch to the main branch using the following commands:

```
git clone https://github.com/beckn/protocol-server.git
cd protocol-server
git checkout master
```

## Installing Protocol Server Dependencies

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

```vbnet
Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==
```

#### Note: Ensure that the installation steps above are completed before generating key pairs. Save your keys in a secure location.

```bash
cd ~  # or go to the directory where you cloned the protocol-server repo.
cd protocol-server
sh setup.sh #  This command not only copies the Follow file to your home directory but also generates a docker_data directory. Within this directory, you'll find the docker-compose.yaml file for configuring the aforementioned services.
#deploy-bap.sh
#deploy-bpp.sh
#dfault-bap-client.yml
#dfault-bap-network.yml
#dfault-bpp-client.yml
#dfault-bpp-network.yml
```

## Deploying MongoDB, RabbitMQ, and Redis Containers using Docker Compose 

In the "docker-data" directory, you'll find a "docker-compose" file facilitating the deployment of MongoDB, RabbitMQ, and Redis containers. Modify  the variables in 'docker-compose.yml' like MongoDB (username, password & database), RabitMQ (username,password).
(Note: set these in the default.yaml files).

```bash
cd ~  # go back to the home directory where you find a docker-data directory.
cd docker-data # go into the "docker-data" directory and you will see the "docker-compose" file
docker-compose up -d  # execute to start the MongoDB, RabbitMQ, Redis containers
docker ps  # check running containers (MongoDB, RabbitMQ, Redis)
```

# Exposing local Protocol-server to Internet

## Setting up LocalTunnel when there is no DNS tool available.

Note: use this when you dont have any DNS URLS to assign 

1. Install localtunnel globally using `npm install -g localtunnel`.
2. Run `lt --port <BAP/BPP network port> --subdomain <any subdomain>` for both BAP and BPP networks (use the same subdomain each time for consistency).
   [Example: `lt --port 5001 --subdomain beckn-bap-network`]

#### Note: Whenever the system or LocalTunnel is restarted the the generated localtunnel DNS will be changed. We have to register the newly generated local-tunnel DNS after restarting in Registry and default.yml files respectively.

## Nginx in Production System (Ubuntu) if you have DNS Tools
Nginx is used to 
1. Update your system: `sudo apt update`.
2. Install Nginx: `sudo apt-get install nginx -y`.
3. Navigate to the Nginx configuration directory: `cd /etc/nginx/conf.d`.
4. Create a new configuration file: `sudo nano {enter-any-name.conf}`. Enter the configuration to map your DNS with the port of BAP/BPP Network&Client.

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

- Copy the generated URLs (LocalTunnel / DNS) and paste them in the URL field on the respective network role tab in the Registry.

- Save the changes.

## Configure Participant Keys:

- In the Registry, go to the participant key tab for both BAP and BPP networks.

- Click the "+" icon to add a participant key entry.

- Provide a key (used as uniqueKey in default.yml).

- Copy the generated public keys from the Key-Pair Generation step and paste them in the "Signing Public Key" and "Encryption Public Key" fields.

- Set the Valid from date to the current date and the Valid until date to a date at least one year ahead.

- Check the "Verified" checkbox and save the entry.

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

# Starting the Protocol Server

## Docker Deployment

To deploy using Docker, follow these steps:

1. Update the port number inside the `deploy-bap.sh` and `deploy-bpp.sh` mentioned in the `default.yml` file.
2. Execute `~/deploy-bap.sh` to deploy the BAP Client and Network.

3. Execute `~/deploy-bpp.sh` to deploy the BPP Client and Network.

## PM2 Deployment

For PM2 deployment, clone the protocol-server repository four times to set up the BAP Client, BAP Network, BPP Client, and BPP Network.

Copy `~/default-bap-client.yml` and `~/default-bap-network.yml` to the config directory in the respective git clone directory of BAP Client and Network.

Also, copy `~/default-bpp-client.yml` and `~/default-bpp-network.yml` to the config directory in the respective git clone directory of BPP Client and Network.

After configuration, Protocol Server can be run as follows:

## To run the instance in Production Mode:

```bash
npm i -g pm2
pm2 start ecosystem.config.js
```

# Step-by-step videos to setup Protocol Server using Docker:

| **No.** | **Video Title**                                 | **Video Description**                                                                                                                     | **Video URL**                                                                                                                                                                                                                                                                                                                                            |
|---------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1       | Basic Prerequisites Video                      | Learn how to clone the repository and use the docker-compose file to start containers for RabbitMQ, MongoDB, and Radis.                   | [Basic Setup Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EQew9FzzQPlHk7L2hlyPn0wBhBmCAb9qQpimpQd82HDW5A?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Ws5p3j)                                |
| 2       | Registry Setup Video                            | Configure the Protocol-Server in the Registry through step-by-step guidance.                                                           | [Registry Setup Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EeoH05vntP1BmQO7PeYxYc8Bg6gtmtaM92Os24SvE_GPvw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=PQ5MUK)                                   |
| 3       | BAP Client and Network Setup Video             | Understand the editing process of BAP Client and Network yaml files and deploying them using Docker.                                   | [BAP Setup Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/Echg4gNAm5lCkhcDOiQsQFsBT_AUNOMldNJlJavGamm9BA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=aZrLSj)                                        |
| 4       | BPP Client and Network Setup Video             | Walkthrough the process of editing BPP Client and Network yaml files and deploying them using Docker.                                  | [BPP Setup Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EWYV-og0CJ1NvDF0Lj9U3DIB9iSrEM55-fEh8-011Ofrvw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=FNWPDR)                                      |
| 5       | Protocol Server - complete Server Setup Video           | A comprehensive guide for the entire Protocol-Server deployment process.                                                                  | [complete Server Setup Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/ETpBtz75kFhAg4pxXn0t8VYB5g_Y0lum6Ln7bGyjYlJSNQ?e=yT46uj&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) |
| 6       | Postman-Collection Testing           | A comprehensive guide for testing the protocol-server using postman-collection.                                                                  | [testing with Postman-Collection Video](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/ETUAYJisun9Mnb6PNRMtd_UBVv0EGqPKCr6JHmHrL5lRJQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Z6JYuu) |


<br>
<br>

# To access the Postman collection please follow these steps:

1. Navigate to the Beckn-Sandbox repository on GitHub, available at [github.com/beckn/beckn-sandbox](https://github.com/beckn/beckn-sandbox).
2. Within the repository, locate and enter the `artifacts` directory.
3. Inside the artifacts directory, find the `Industry 4.0` collection.
4. Once you have located the Industry 4.0 collection, open it and copy the URL directly from your browser's address bar.
5. Paste this URL into Postman to begin working with the collection.


The above video is a complete video for Protocol-Server deployment.

**Note**: This setup is done on an Ubuntu server for setting up the protocol-server. Download the supporting Applications (Node, Npm, Docker) as per your System/Machine
