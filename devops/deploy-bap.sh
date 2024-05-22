cp ~/Dockerfile ~/default-bap-client.yml ~/default-bap-network.yml ~/protocol-server
cd ~/protocol-server

sudo sudo docker build -t bap-client --build-arg default_yml=default-bap-client.yml --build-arg port=5001 .
sudo sudo docker build -t bap-network --build-arg default_yml=default-bap-network.yml --build-arg port=5002 .

sudo docker stop bap-network bap-client
sudo docker rm bap-network bap-client
sudo docker run --name bap-client -it -d --network host bap-client:latest
sudo docker run --name bap-network -it -d --network host bap-network:latest