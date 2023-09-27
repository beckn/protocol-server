#!/bin/bash
cp devops/deploy-bap.sh ~/
cp devops/deploy-bpp.sh ~/
cp devops/Dockerfile ~/
cp config/samples/bap-client.yaml ~/dfault-bap-client.yml
cp config/samples/bap-network.yaml ~/dfault-bap-network.yml
cp config/samples/bpp-client.yaml ~/dfault-bpp-client.yml
cp config/samples/bpp-network.yaml ~/dfault-bpp-network.yml
mkdir docker_data && cp docker/docker-compose.yaml ~/docker_data