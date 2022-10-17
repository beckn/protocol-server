# _Beckn Protocol Server_

## _Overview_

Beckn Protocol Server is a service that helps the application connect to Beckn Network. It follows the[ Beckn Protocol](https://beckn.network/protocol) and makes it more accessible for the applications to get started with Beckn implementation. Any network participant can run this server and connect to Beckn Network.

## _Features_

        •           Connects a client application with the Beckn network.


        •           Acts as BAP Adaptor in case of Beckn Application Platform.


        •           Acts as BPP Adaptor in case of Beckn Provider Platform.


        •           Validates each request as per the Beckn Network’s Open API schema.


        •           Generates signatures for the outgoing requests and validates signatures for the incoming requests.


        •           Stores log for each process.


        •           Comes with key generation scripts for the Network participants.

## _Installation_

There are multiple ways for installing Beckn Protocol Server.

### _Pre-requisite_

        •          [ MongoDB](https://www.mongodb.com/products/mongodb-enterprise-edition)


        •          [ Redis](https://redis.io/). Version 3.x or higher is required.


        •          [ Docker](https://www.docker.com/community-edition)


        •          [ GitHub CLI](https://help.github.com/en/github/setting-up-and-managing-a-repository/using-the-command-line-interface)


        •          [ Git](https://git-scm.com/downloads)


        •          [ Node.js](https://nodejs.org/en/download/). Version 16.x or higher is recommended.


        •          [ NPM](https://www.npmjs.com/get-npm). Version 5.x or higher is recommended.


        •          [ Yarn](https://yarnpkg.com/en/docs/install)


        •          [ Typescript](https://www.typescriptlang.org/). Version 3.x or higher is recommended.

### **Download the Beckn Protocol Server from[ GitHub](https://github.com/beckn/protocol-server)**

#### _Procedure for Running using Github Repository_

        1.         Clone the repository.


              git clone https://github.com/beckn/protocol-server


        2.         Install the dependencies.


              cd protocol-server


        npm install


        3.         Build the application.


              npm run build


        4.         Run the server.


              npm run start


                     Running using pm2


              npm install -g pm2


        pm2 start ecosystem.config.js

### _Using Docker_

Beckn Protocol Server’s Docker image is available on[ Docker Hub](https://hub.docker.com/r/beckn/protocol-server/). You can use the image directly by running the following command.

#### _Procedure for Running using Docker_

        1.         Run the following command to pull the image.


              docker pull beckn/protocol-server


        2.         Run the following command to run the image.


              docker run -d -p 8080:8080 beckn/protocol-server


        3.         Run the following command to check the status of the image.


              docker ps

## _Configuration_

Please follow the[ Configuration Guide](https://github.com/beckn/protocol-server/Configuration_Guide.md) to configure the Beckn Protocol Server.

## _Keys Generation_

Beckn Protocol Server comes with key generation scripts for the Network participants. You can use the scripts to generate the keys for the Network participants.

### _Pre-requisite for Key Generation_

In order to generate the keys, you need to have the following pre-requisite.

        •          [ GitHub CLI](https://help.github.com/en/github/setting-up-and-managing-a-repository/using-the-command-line-interface)


        •          [ Git](https://git-scm.com/downloads)


        •          [ Node.js](https://nodejs.org/en/download/). Version 16. x or higher is recommended.


        •          [ NPM](https://www.npmjs.com/get-npm). Version 5. x or higher is recommended.


        •          [ Yarn](https://yarnpkg.com/en/docs/install)

### _Procedure for Generating Keys_

        1.         Clone the repository.


              git clone https://github.com/beckn/protocol-server


        2.         Install the dependencies.


              cd protocol-server


        npm install


        3.         Run the following command to generate the keys.


              npm run generate-keys

### _Output_

Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==

Please save your keys in a secure location.

## _Documentation_

Beckn Protocol Server follows dual gateway architecture. It has two gateways, one for the Client-side Application and one for the Beckn Network.

All the requests or responses sent from the Client-side Application are sent to the Client-side gateway first.

Each incoming request or response from the network is handled by the Network-side gateway. The Network-side gateway validates the request or response and sends it to the Client-side gateway.

The Network-side is responsible for communicating with the Beckn Network while the Client-side is responsible for communicating with the Client-side Application.

### License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
