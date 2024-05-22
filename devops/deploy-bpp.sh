cp ~/Dockerfile ~/default-bpp-client.yml ~/default-bpp-network.yml ~/protocol-server
cd ~/protocol-server

sudo docker build -t bpp-client --build-arg default_yml=default-bpp-client.yml --build-arg port=6001 .
sudo docker build -t bpp-network --build-arg default_yml=default-bpp-network.yml --build-arg port=6002 .

sudo docker stop bpp-network bpp-client
sudo docker rm bpp-network bpp-client
sudo docker run --name bpp-client -it -d --network host bpp-client:latest
sudo docker run --name bpp-network -it -d --network host bpp-network:latest