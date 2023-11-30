#!/bin/bash
cp devops/deploy-bap.sh ~/
cp devops/deploy-bpp.sh ~/
cp devops/Dockerfile ~/
cp config/samples/bap-client.yaml ~/default-bap-client.yml
cp config/samples/bap-network.yaml ~/default-bap-network.yml
cp config/samples/bpp-client.yaml ~/default-bpp-client.yml
cp config/samples/bpp-network.yaml ~/default-bpp-network.yml
mkdir ~/docker_data && cp docker/docker-compose.yaml ~/docker_data/
