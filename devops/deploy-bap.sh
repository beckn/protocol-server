cp Dockerfile default-bap-client.yml default-bap-network.yml ~/protocol-server
cd ~/protocol-server

docker build -t bap-client --build-arg default_yml=default-bap-client.yml --build-arg port=5001 .
docker build -t bap-network --build-arg default_yml=default-bap-network.yml --build-arg port=5000 .

docker stop bap-network bap-client
docker rm bap-network bap-client
docker run --name bap-client -it -d --network host bap-client:latest
docker run --name bap-network -it -d --network host bap-network:latest