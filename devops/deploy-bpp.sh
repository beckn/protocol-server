cp $HOME/Dockerfile $HOME/default-bpp-client.yml $HOME/default-bpp-network.yml $HOME/protocol-server
cd $HOME/protocol-server

sudo docker build -t bpp-client --build-arg default_yml=default-bpp-client.yml --build-arg port=BPP_CLIENT_PORT .
sudo docker build -t bpp-network --build-arg default_yml=default-bpp-network.yml --build-arg port=BPP_NETWORK_PORT .

sudo docker stop bpp-network bpp-client
sudo docker rm bpp-network bpp-client
sudo docker run --name bpp-client -it -d --network host bpp-client:latest
sudo docker run --name bpp-network -it -d --network host bpp-network:latest