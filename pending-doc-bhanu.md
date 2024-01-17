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
5. enter into docker-data dir and you find a docker-compose file which helps for deploying MongoDB, RabbitMQ, Redis continers.
6. do change the variables as you want it to be (Note: these should be set in default.yaml files)
7. execute `docker-compose up -d` to start the (MongoDB, RabbitMQ, Redis) containers  

## Developer system setup

As the Protocol Server repository is Public, clone the repository and checkout to main branch.

`git clone https://github.com/beckn/protocol-server.git`

`cd protocol-server`

`git checkout master`

### Install
You can utilize Docker to deploy the MongoDB, RabbitMQ and Redis services. We've included an illustrative docker-compose file located in docker/docker-compose.yaml.

To set things up effortlessly, run the setup.sh command. This command not only copies the Follow file to your home directory but also generates a docker_data directory. Within this directory, you'll find the docker-compose.yaml file for configuring the aforementioned services.
Additionally, here's a list of files included for your reference:

•	deploy-bap.sh

•	deploy-bpp.sh

•	dfault-bap-client.yml

•	dfault-bap-network.yml

•	dfault-bpp-client.yml

•	dfault-bpp-network.yml

Feel free to explore and use these resources as needed for your setup.

Please set the user name and password as per requirement in docker-compose.yaml file inside docker_data directory.
bash setup.sh

Installation of the Protocol Server consists of installing the necessary dependencies and building the project as the project is written in TypeScript.

`npm i`

`npm run build`

`Key-Pair Generation`


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

# Configure

### Register Local BAP and BPP Networks:

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

### Set Up Local Tunneling:

•	Install localtunnel globally using npm install -g localtunnel.

•	Run lt --port <BAP/BPP network port> --subdomain <any subdomain> for both BAP and BPP networks (use the same subdomain each time for consistency).

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

### Update Configuration Files which we have copied at home directory

•	In the BAP Client and BAP Network codebases, update the ~/dfault-bap-client.yml and ~/dfault-bap-network.yml file with the following values:

o	Private Key: Copy the private key generated in step Key-Pair Generation.

o	Public Key: Copy the public key generated in step Key-Pair Generation.

o	Subscriber Id: Copy the subscriber ID from the respective Registry entry.

o	Subscriber Uri: Copy the subscriberUri from the Registry entry.

o	Unique Key: Copy the participant-key from the Registry entry (participant key tab).

### In the BPP Client and BPP Network codebases, update the ~/dfault-bpp-client.yml and ~/dfault-bpp-network.yml file with the following values:

o	Private Key: Copy the private key generated in step Key-Pair Generation.

o	Public Key: Copy the public key generated in step Key-Pair Generation.

o	Subscriber Id: Copy the subscriber ID from the respective Registry entry.

o	Subscriber Uri: Copy the subscriberUri from the Registry entry.

o	Unique Key: Copy the participant-key from the Registry entry (participant key tab).

o	WebhookURL: Copy paste the URL that you generate by running localtunnel for sandbox-webhook

## Run
### Docker deployment
Update the port number inside the deploy-bap.sh and deploy-bpp.sh which you have mentioned in the default.yml file. Execute ~/deploy-bap.sh file to deploye the the BAP Client and Network.

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
