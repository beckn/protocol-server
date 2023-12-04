#!/bin/bash

#Colour Code
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
NC=$(tput sgr0)


#Comman Variables with Default values
mongo_initdb_root_username="beckn"
mongo_initdb_root_password="beckn123"
mongo_initdb_database="protocol_server"
rabbitmq_default_user="beckn"
rabbitmq_default_pass="beckn123"
registry_url="https://registry.becknprotocol.io/subscribers"


#BAP varibales. 

bapClientFile="$HOME/default-bap-client.yml"
bapNetworkFile="$HOME/default-bap-network.yml"

bap_client_port=5001
bap_network_port=5002


#BPP varibales. 

bppClientFile="$HOME/default-bpp-client.yml"
bppNetworkFile="$HOME/default-bpp-network.yml"

bpp_client_port=6001
bpp_network_port=6002