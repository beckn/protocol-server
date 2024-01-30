# Protocol Server Setup Guide for Local System

# pre-requisites 

[Node](https://nodejs.org/en/download)

[Docker](https://www.docker.com/products/docker-desktop/)

# Setting up Protocol-server BAP-Client and BAP-Network

<br>

## BAP

1.To Install Protocol Server : BAP-Client and BAP-Network. Clone the protocol-server repository two times and rename as PS-BAP-Client and PS-BAP-Network.

   ```
   git clone https://github.com/beckn/protocol-server.git
   cd {folder_name}
   git checkout master
   npm i
   ```

2. Create default.yml file in PS-BAP-Client dir at location `~/config/default.yml`. 

3. Create default.yml file in PS-BAP-Network dir at location `~/config/default.yml`

4. Navigate to `docker` dir in PS-BAP-Client/PS-BAP-Network for `docker-compose.yml` file to run dockeer containers of redis, mongodb and rabbitmq.

[NOTE]This step required only once. These containers can be used same for the BAP-Client, BAP-Network & BPP-Client, BPP-Network

   ```
   cd docker
   docker-compose up -d
   ```

5. Copy the content of `~/config/samples/bap-client.yaml` and paste it to `~/config/default.yml` in BAP-client.  

6. copy the content of `~/config/samples/bap-network.yaml` and paste it to `~/config/default.yml` in BAP-network.  

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

8. To expose local PS-BAP-Network to Internet follow [Exposing local Protocol-server to Internet]

9. After generating URL follow [Registering on BECKN Registry] to register the PS-BAP-Network.

10. After Registering, Now Configure the `default.yml` of both PS-BAP-Client and PS-BAP-Network as per below specification.

   - **Port:** Enter the port where you want to run your application.

   - **Cache:** Change the host and port where your Redis is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.

   - **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file. This url will also be used in synchronous mode as `mongoURL`

   - **Private Key:** Copy the private key generated in the Key-Pair Generation step.

   - **Public Key:** Copy the public key generated in the Key-Pair Generation step.

   - **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.

   - **Subscriber Uri:** Copy the subscriberUri from the Registry entry.

   - **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).
     <br><br>

11. To run the `BAP-Client` in Development Mode (For Debug Purposes) :

      ```bash
      cd PS-BAP-Client
      npm run dev
      ```
12. To run the `BAP-Network` in Development Mode (For Debug Purposes) :


      ```bash
      cd PS-BAP-Network
      npm run dev
      ```

## BPP :


1. To Install Protocol Server : BPP-Client and BPP-Network. Clone the protocol-server repository two times and rename as PS-BPP-Client and PS-BPP-Network.

   ```
   git clone https://github.com/beckn/protocol-server.git
   cd {folder_name}
   git checkout master
   npm i
   ```

2. Create default.yml file in PS-BPP-Client dir at location `~/config/default.yml`. 

3. Create default.yml file in PS-BPP-Network dir at location `~/config/default.yml`

4. Navigate to `docker` dir in PS-BPP-Client/PS-BPP-Network for `docker-compose.yml` file to run dockeer containers of redis, mongodb and rabbitmq.

      [NOTE] This step required only once if executed earlier for `BAP` skip this. These containers can be used same for the BPP-Client, BPP-Network & BPP-Client, BPP-Network

   ```
   cd docker
   docker-compose up -d
   ```

5. Copy the content of `~/config/samples/BPP-client.yaml` and paste it to `~/config/default.yml` in BPP-client.  

6. copy the content of `~/config/samples/BPP-network.yaml` and paste it to `~/config/default.yml` in BPP-network.  

7. To generate key pairs that will be used in registry entry and `default.yml` files, go into PS-BPP-Network dir and run

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

8. To expose local PS-BPP-Network to Internet follow [Exposing local Protocol-server to Internet]

9. After generating URL follow [Registering on BECKN Registry] to register the PS-BPP-Network.

10. After Registering, Now Configure the `default.yml` of both PS-BPP-Client and PS-BPP-Network as per below specification.

   - **Port:** Enter the port where you want to run your application.

   - **Cache:** Change the host and port where your Redis is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0" and `port` to 6379.

   - **Response Cache:** Change the host and port where your MongoDB is running. If you are running it on the same machine using a Docker Compose file, set `host` to "0.0.0.0," `port` to 27017, and provide the username, password, and database as set in the Docker Compose file.

   - **Private Key:** Copy the private key generated in the Key-Pair Generation step.

   - **Public Key:** Copy the public key generated in the Key-Pair Generation step.

   - **Subscriber Id:** Copy the subscriber ID from the respective Registry entry.

   - **Subscriber Uri:** Copy the subscriberUri from the Registry entry.

   - **Unique Key:** Copy the participant-key from the Registry entry (participant key tab).

   - **Webhook URL:** Copy the public URL generated by the local-tunnel for webhook.
     <br><br>
 11. To run the `BPP-Client` in Development Mode (For Debug Purposes) :

      ```bash
      cd PS-BPP-Client
      npm run dev
      ```
12. To run the `BPP-Network` in Development Mode (For Debug Purposes) :


      ```bash
      cd PS-BPP-Network
      npm run dev
      ```

# Exposing local Protocol-server to Internet

## Setting up LocalTunnel in Local System/Developer when there is no DNS Tools available

1. Install localtunnel globally using `npm install -g localtunnel`.
2. Run `lt --port <BAP/BPP network port> --subdomain <any subdomain>` for both BAP and BPP networks (use the same subdomain each time for consistency).
   [Example: `lt --port 5001 --subdomain beckn-bap-network`]

## [NOTE]

Whenever the system or LocalTunnel is restarted the the generated localtunnel DNS will be changed. We have to register the new generated localtunnel DNS after restart in Registry and default.yml files respectively.  
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

