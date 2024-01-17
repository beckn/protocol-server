# Introduction

Beckn Protocol Server is a service that helps the application connect to Beckn Network. It follows the Beckn Protocol and makes it more accessible for the applications to get started with Beckn implementation. Any network participant can run this server and connect to Beckn Network.

# Architecture

 
![image](https://github.com/beckn/protocol-server/assets/126443511/af9093a8-14d5-4d9d-a13d-c2bdfc267d78)


## Parts of protocol server - Client/Network and Webhook in case of BPP

•	what does the client do, what does the Network do

There would 2 instances of Protocol Server that is running. One is Client facing and the other is Network facing.

## In the case of BAP

**Client** facing Protocol Server manages building the context, validating the request body as per the Standard Beckn Open API schema, listens to the Message Queue, Aggregates the results in the case of Synchronous mode and forwards the results to the client side application as a webhook callback.

**Network** facing Protocol Server manages forwarding the request to the respective Participant or Beckn Gateway (BG). Also it validates the incoming requests from Participants & BG as per the Standard Beckn Open API schema and then validates the signature sent from the clients to ensure the data integrity.

## In the case of BPP

**Client** facing Protocol Server listens to the Message Queue and forwards the request to client side application, exposes an endpoint where the client side application can send the results to the network which is again validated against the Standard Beckn Open API schema and pushed to the network facing Protocol Server.

**Network** facing Protocol Server also listens to the Message Queue and forwards the request to the respective Participant or BG. Also it validates the incoming requests from Participants & BG as per the Standard Beckn Open API schema and then validates the signature sent from the clients to ensure the data integrity.

# Use of protocol server

Protocol server is the application that helps the BAP and BPP interact with the network. Apart from network interaction it also does validation of the network participant and keeps track of the request and responses made to the network or any network participant

# Requirements

•	Node.js version 16 or above 

•	npm version 8 or above

•	MongoDB version 4.4 or above

•	RabbitMQ version 3.8 or above

•	Redis version 6.2 or above

(Optional)

•	Docker version 20.10 or above

**Note** : we need to have a docker desktop setup to run docker-compose while setting up on the development environment (windows/IOS)
we suggest setting up the above requirements (MongoDB, RabbitMQ, Redis) using the docker

## steps using docker: 
1. cloning the Repo.
2. enter into the protocol-server dir 
3. execute `sh setup.sh`
4. go back to home dir where you find a docker-data dir
5. enter into docker-data dir and you find a docker-compose file which helps for deploying MongoDB, RabbitMQ, Redis containers.
6. do change the variables as per your requirement (Note: these should be set in default.yaml files)
7. execute `docker-compose up -d` to start the (MongoDB, RabbitMQ, Redis) containers  

### Cloning the github

As the Protocol Server repository is Public, clone the repository and checkout to main branch.

`git clone https://github.com/beckn/protocol-server.git`

`cd protocol-server`

`git checkout master`

### setup the Requirements

#### Installation of node.js and npm using nvm (ubuntu machine)

`sudo apt update`

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`

`source ~/.bashrc`

`nvm install node`

`nvm install 16`

`nvm use 16`

`nvm alias default 16`

`node --version`

`npm --version`

#### Installation of docker for RabbitMQ, MongoDB & Redis deployment using docker-compose

`sudo apt update`

`sudo apt install -y apt-transport-https ca-certificates curl software-properties-common`

`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg`

`echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`

`sudo apt update`

`sudo apt install -y docker-ce docker-ce-cli containerd.io`

`sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

`sudo chmod +x /usr/local/bin/docker-compose`

`sudo docker --version && docker-compose --version`

`sudo usermod -aG docker $USER`

`newgrp docker`

`cd ~` or go to the dir where you cloned the protocol-server repo.

`cd protocol-server`

execute `sh setup.sh` 

go back to home dir where you find a docker-data dir

enter into docker-data dir and you find a docker-compose file which helps for deploying MongoDB, RabbitMQ, Redis continers.

do change the variables as you want it to be (Note: these should be set in default.yaml files)

execute `docker-compose up -d` to start the (MongoDB, RabbitMQ, Redis) containers

`docker ps` to check the (MongoDB, RabbitMQ, Redis) running containers


### Steps to setup the protocol server - BAP/BPP

Installation of the Protocol Server consists of installing the necessary dependencies and building the project as the project is written in TypeScript.

`cd protocol-server`

`npm i`

`npm run build`

### Key-Pair Generation

Beckn Protocol Server comes with key generation scripts for the Network participants. You can use the scripts to generate the keys for the Network participants.

NOTE: To generate the key pairs, the above steps must be completed.

`npm run generate-keys`

Sample Output
Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==

Please save your keys in a secure location.


## Steps to setup the protocol server - BAP & BPP (client & network) Docker-based setup on cloud :

We have tested this setup in ubuntu machine, also we need to have root access.


For Updating the OS, Steps to set up docker, Steps to setup docker-compose follow the steps given in (Installation of docker for RabbitMQ, MongoDB & Redis deployment using docker-compose)

`cd ~` it takes you to your home dir where protocol-server & othyer yaml files are present

### To deploy BAP Client and BAP Network codebases, update the ~/dfault-bap-client.yml and ~/dfault-bap-network.yml file with the following values:

o	port : enter the port you want to run your 

o cache: change the host and port where your radis is running, if you are running in same machine using docker-compose file then host = "0.0.0.0" port = 6379 

o responseCache: change the host and port where your MongoDB is running, if you are running in same machine using docker-compose file then host = "0.0.0.0" port = 27017 and set username, password and db as set in docker-compose file. 

o	Private Key: Copy the private key generated in step Key-Pair Generation.

o	Public Key: Copy the public key generated in step Key-Pair Generation.

o	Subscriber Id: Copy the subscriber ID from the respective Registry entry.

o	Subscriber Uri: Copy the subscriberUri from the Registry entry.

o	Unique Key: Copy the participant-key from the Registry entry (participant key tab).

### In the BPP Client and BPP Network codebases, update the ~/dfault-bpp-client.yml and ~/dfault-bpp-network.yml file with the following values:

o	port : enter the port you want to run your 

o cache: change the host and port where your radis is running, if you are running in same machine using docker-compose file then host = "0.0.0.0" port = 6379 

o responseCache: change the host and port where your MongoDB is running, if you are running in same machine using docker-compose file then host = "0.0.0.0" port = 27017 and set username, password and db as set in docker-compose file. 

o	Private Key: Copy the private key generated in step Key-Pair Generation.

o	Public Key: Copy the public key generated in step Key-Pair Generation.

o	Subscriber Id: Copy the subscriber ID from the respective Registry entry.

o	Subscriber Uri: Copy the subscriberUri from the Registry entry.

o	Unique Key: Copy the participant-key from the Registry entry (participant key tab).

o	WebhookURL: Copy paste the URL that you generate by running localtunnel for sandbox-webhook 

### Exposing BAP/BPP API over LOCAL tunnel

•	Install localtunnel globally using `npm install -g localtunnel`.

•	Run `lt --port <BAP/BPP network port> --subdomain <any subdomain>` for both BAP and BPP networks (use the same subdomain each time for consistency). [EX: `lt --port 5001 --subdomain beckn-bap-network`]

### Step to setup Nginx/haproxy in cloud (ubuntu)

`sudo apt update`

`sudo apt-get install nginx -y`

`cd /etc/nginx/conf.d`

`sudo nano {enter-any-name.conf}` create a conf file and enter the configuration to map your dns with port. ex :- 

#### server {
####     listen 80;
####     listen [::]:80;
####     server_name example.domin.com;
#### 
####     location / {
####         proxy_set_header Host $http_host;
####         proxy_set_header X-Real-IP $remote_addr;
####         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#### 
####         proxy_http_version 1.1;
####         proxy_set_header Upgrade $http_upgrade;
####         proxy_set_header Connection "upgrade";
#### 
####         proxy_pass http://localhost:port;
####     }
#### }

#### server {
####     listen 443 ssl http2;
####     listen [::]:443 ssl http2;
####     server_name example.domin.com;
#### 
####     location / {
####         proxy_set_header Host $http_host;
####         proxy_set_header X-Real-IP $remote_addr;
####         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#### 
####         proxy_http_version 1.1;
####         proxy_set_header Upgrade $http_upgrade;
####         proxy_set_header Connection "upgrade";
#### 
####         proxy_pass http://localhost:port;
####     }
#### 
####     ssl_certificate /etc/letsencrypt/live/example.domin.com/fullchain.pem;
####     ssl_certificate_key /etc/letsencrypt/live/example.domin.com/privkey.pem;
#### 
####     ssl_session_timeout 1d;
####     ssl_session_cache shared:MozSSL:10m;
####     ssl_session_tickets off;
#### 
####     ssl_protocols TLSv1.2 TLSv1.3;
####     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE- 
####     ECDSA- 
####     CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
####     ssl_prefer_server_ciphers on;
#### 
####     add_header Strict-Transport-Security "max-age=63072000" always;
#### 
####     ssl_stapling on;
####     ssl_stapling_verify on;
#### 
####     resolver 8.8.8.8;
#### }




in the above example please change `example.domin.com` and `port` as your requirement in multiple places.

get SSL certification done on your machine for your domain.

# Registering on BECKN registry

•	Access the [Registry URL](https://registry.becknprotocol.io/login).

•	Log in using your Gmail ID.

### Create Network Participants:

•	In the Registry, navigate to the admin tab and select "Network Participant."

•	Click the "+" icon to create entries for both the BAP and BPP networks.

•	Enter ParticipantIDs for each network, for BAP Network and BPP Network. (Note: We will call this as "subscriberIDs" going further.)

### Configure Network Roles:

•	Edit the created entries for BAP and BPP networks.

•	Select the "Network Role Tab."

•	Choose the network domain (leave it blank for universal BAP/BPP).

•	Set the Type as "BAP" for BAP network and "BPP" for BPP network.

•	Enter the respective "SubscriberID" created in step Create Network Participants

•	Set the Status field to "subscribed."

### Update Registry URLs:

•	Copy the generated URLs and paste them in the URL field on the respective network role tab in the Registry.

•	Save the changes.

### Configure Participant Keys:

•	In the Registry, navigate to the participant key tab for both BAP and BPP networks.

•	Click the "+" icon to add a participant key entry.

•	Provide a key (used as uniqueKey in default.yml).

•	Copy the generated public keys in step Key-Pair Generation and paste them in the "Signing Public Key" and "Encryption Public Key" fields.

•	Set the Valid from date to the current date and the Valid until date to a date at least one year ahead.

•	Check the "Verified" checkbox and save the entry.

## Run
### Docker deployment

Update the port number inside the deploy-bap.sh and deploy-bpp.sh which you have mentioned in the default.yml file.

Execute ~/deploy-bap.sh file to deploye the the BAP Client and Network.

Execute ~/deploy-bpp.sh file to deploye the the BPP Client and Network.

### PM2 deployment

For PM2 deployment you need to git clone protocol-server four times to setup the BAP Client and Network and BPP Client and Network. 
Then copy ~/dfault-bap-client.yml and ~/dfault-bap-network.yml to config directory in respective git clone directory of BAP Client and Network. 

Also copy ~/dfault-bpp-client.yml and ~/dfault-bpp-network.yml to config directory in respective git clone directory of BPP Client and Network.

After configuration, Protocol Server can be run as below.

### To run the instance in Development Mode (For Debug Purposes):

`npm run dev`
### To run the instance in Production Mode:

`npm i -g pm2`

`pm2 start ecosystem.config.js`

## Recoding on steps to set up Protocol Server using Docker:

[Protocol Server - Local Setup](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/ETpBtz75kFhAg4pxXn0t8VYB5g_Y0lum6Ln7bGyjYlJSNQ?e=yT46uj&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)

[Note: this setup is done on ubuntu server for setting up the protocol-server]
