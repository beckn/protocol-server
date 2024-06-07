# Protocol Server Setup Guide for Local System

## prerequisites 

[Node](https://nodejs.org/en/download)

[Docker](https://www.docker.com/products/docker-desktop/)

## Setting up Protocol-server BAP-Client and BAP-Network instance

<br>

1. Clone the protocol-server repository twice and rename the project folders to
   1. PS-BAP-Client
   2. PS-BAP-Network

   ```
   git clone https://github.com/beckn/protocol-server.git
   cd {folder_name}
   git checkout master
   npm i
   ```

2. Create default.yml file in PS-BAP-Client directory at location `~/config/default.yml`. 

3. Create default.yml file in PS-BAP-Network directory at location `~/config/default.yml`

4. To install Redis, MongoDB and RabbitMQ on docker, navigate to `docker` directory in either PS-BAP-Client or PS-BAP-Network and run docker-compose using below command.

__NOTE: The same instance of Redis, MongoDB, and RabbitMQ can be used for the BAP-Client, BAP-Network & BPP-Client, BPP-Network__ 

   ```
   cd docker
   docker-compose up -d
   ```

5. Copy the content of `PS-BAP-Client/config/samples/bap-client.yaml` and paste it to `PS-BAP-Client/config/default.yml`.  

6. copy the content of `PS-BAP-Network/config/samples/bap-network.yaml` and paste it to `PS-BAP-Network/config/default.yml`.  

7. To generate key pairs that will be used in registry entry and `default.yml` files, go into PS-BAP-Network dir and run

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

8. To expose local PS-BAP-Network to the Internet follow [Exposing local Protocol-server to Internet](https://github.com/beckn/protocol-server/blob/master/Local-Setup.md#exposing-local-protocol-server-to-internet)

9. After generating the public URL follow [Registering on BECKN Registry](https://github.com/beckn/protocol-server/blob/master/Local-Setup.md#registering-on-beckn-registry) to register the PS-BAP-Network on Beckn registry.

10. After Registration, configure the `default.yml` of both PS-BAP-Client and PS-BAP-Network as per the details provided below.


      - **Port:** Enter the port where you want to run your application.
      
      - **Cache:** Change the host and port where your Redis is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.
      
      - **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file. This url will also be used in synchronous mode as `mongoURL`
      
      - **Private Key:** Copy the private key generated in the Key-Pair Generation step.
      
      - **Public Key:** Copy the public key generated in the Key-Pair Generation step.
      
      - **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.
      
      - **Subscriber Uri:** Copy the subscriberUri from the Registry entry.
      
      - **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).

     

11. Run the `BAP-Client` in Development Mode :

      ```bash
      cd PS-BAP-Client
      npm run dev
      ```
12. Run the `BAP-Network` in Development Mode :


      ```bash
      cd PS-BAP-Network
      npm run dev
      ```

## Setting up Protocol-server BPP-Client and BPP-Network instance



1. Clone the protocol-server repository twice and rename the project folders to
   1. PS-BPP-Client
   2. PS-BPP-Network

   ```
   git clone https://github.com/beckn/protocol-server.git
   cd {folder_name}
   git checkout master
   npm i
   ```

2. Create default.yml file in PS-BPP-Client directory at location `~/config/default.yml`. 

3. Create default.yml file in PS-BPP-Network directory at location `~/config/default.yml`

4. To install Redis, MongoDB and RabbitMQ on docker, navigate to `docker` directory in either PS-BPP-Client or PS-BPP-Network and run docker-compose using the below command.

__NOTE: The same instance of Redis, MongoDB, and RabbitMQ can be used for the BAP-Client, BAP-Network & BPP-Client, BPP-Network__ 

   ```
   cd docker
   docker-compose up -d
   ```

5. Copy the content of `BPP-client/config/samples/BPP-client.yaml` and paste it to `BPP-client/config/default.yml`.  

6. copy the content of `BPP-network/config/samples/BPP-network.yaml` and paste it to `BPP-network/config/default.yml`.  

7. To generate key pairs that will be used in registry entry and `default.yml` files, go into PS-BPP-Network directory and run

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

8. To expose local PS-BPP-Network to the Internet follow [Exposing local Protocol-server to Internet](https://github.com/beckn/protocol-server/blob/master/Local-Setup.md#exposing-local-protocol-server-to-internet)

9. After generating the public URL follow [Registering on BECKN Registry](https://github.com/beckn/protocol-server/blob/master/Local-Setup.md#registering-on-beckn-registry) to register the PS-BPP-Network on Beckn registry.

10. After registration, configure the `default.yml` of both PS-BPP-Client and PS-BPP-Network as per the details provided below.

      - **Port:** Enter the port where you want to run your application.
   
      - **Cache:** Change the host and port where your Redis is running. If running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.
   
      - **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file.
   
      - **Private Key:** Copy the private key generated in the Key-Pair Generation step.
   
      - **Public Key:** Copy the public key generated in the Key-Pair Generation step.
   
      - **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.
   
      - **Subscriber Uri:** Copy the subscriberUri from the Registry entry.
   
      - **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).
   
      - **Webhook URL:** Copy the public URL generated by the local-tunnel for webhook.
     <br><br>
 11. Run the `BPP-Client` in Development Mode :

      ```bash
      cd PS-BPP-Client
      npm run dev
      ```
12. Run the `BPP-Network` in Development Mode :


      ```bash
      cd PS-BPP-Network
      npm run dev
      ```

# Exposing local Protocol-server to Internet

## Setting up LocalTunnel in Local System/Developer when there is no DNS Tools available

1. Install localtunnel globally using `npm install -g localtunnel`.
2. Run `lt --port <BAP/BPP network port> --subdomain <any subdomain>` for both BAP and BPP networks (use the same subdomain each time for consistency).
   [Example: `lt --port 5001 --subdomain beckn-bap-network`]

__NOTE:
Whenever the system or LocalTunnel is restarted the the generated localtunnel DNS will be changed. We have to register the newly generated local tunnel DNS after restarting the registry and default.yml files respectively.__  
<br>

# Registering on BECKN Registry

To register on the BECKN Registry, follow these steps:

1. Access the [Registry URL](https://registry.becknprotocol.io/login).

2. Create an account using signup flow.

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

- Copy the generated URLs (LocalTunnel) and paste them in the URL field on the respective network role tab in the Registry.

- Save the changes.

## Configure Participant Keys:

- In the Registry, go to the participant key tab for both BAP and BPP networks.

- Click the "+" icon to add a participant key entry.

- Provide a key (used as uniqueKey in default.yml).

- Copy the generated public keys from the Key-Pair Generation step and paste them in the "Signing Public Key" and "Encryption Public Key" fields.

- Set the Valid from date to the current date and the Valid until date to a date at least one year ahead.

- Check the "Verified" checkbox and save the entry.

<br>

## Local Setup Tutorial Video:

- [Link for BAP-Setup](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EaR63Kwy5StFnHs-SaE7GskBU5-cPAUiwetIwhM5PijCig?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=VnDliz)
  
- [Link for BPP-setup](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EdqIID6kCfdFoYpzie3Sm74B-qM4395czCwByKsZyWSe4Q?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=UN57wh)

- [Link for Postman-collection testing for Protocol-server](https://mindsenterprise-my.sharepoint.com/:v:/g/personal/bhanuprakash_reddy_eminds_ai/EVwXRc6DIfJBiGiZR61avuYBiqIZh_rKrjC_g11AuVvQ5g?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=2WHIeV)

To access the Postman collection please follow these steps:

1. Navigate to the Beckn-Sandbox repository on GitHub, available at [github.com/beckn/beckn-sandbox](https://github.com/beckn/beckn-sandbox).
2. Within the repository, locate and enter the `artifacts` directory.
3. Inside the artifacts directory, find the `Industry 4.0` collection.
4. Once you have located the Industry 4.0 collection, open it and copy the URL directly from your browser's address bar.
5. Paste this URL into Postman to begin working with the collection.

