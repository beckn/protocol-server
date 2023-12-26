cp $HOME/Dockerfile $HOME/default-bap-client.yml $HOME/default-bap-network.yml $HOME/protocol-server
cd $HOME/protocol-server

sudo sudo docker build -t bap-client --build-arg default_yml=default-bap-client.yml --build-arg port=BAP_CLIENT_PORT .
sudo sudo docker build -t bap-network --build-arg default_yml=default-bap-network.yml --build-arg port=BAP_NETWORK_PORT .

sudo docker stop bap-network bap-client
sudo docker rm bap-network bap-client
sudo docker run --name bap-client -it -d --network host bap-client:latest
sudo docker run --name bap-network -it -d --network host bap-network:latest