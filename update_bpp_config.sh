#!/bin/bash

source registry_entry.sh
source generate_keys.sh
source variables.sh
source package_manager.sh

display_help() {
    # Define color codes
    echo "${YELLOW}usage: $0 [options]${NC}"
    echo "${GREEN}options:${NC}"
    echo "  --help${NC}                   display this help message"
    echo "  ${RED}--bpp_subscriber_id <value>${NC}   set bpp_subscriber_id ${RED}(required)${NC}"
    echo "  ${RED}--bpp_subscriber_uri <value>${NC}  set bpp_subscriber_uri ${RED}(required)${NC}"
    echo "  --registry_url <value>    set registry_url without lookup"
    echo "    For example if your registry lookup URL is ${GREEN}$registry_url/lookup${NC}"
    echo "    then enter only ${GREEN}$registry_url${NC}"
    echo "    (default: ${GREEN}$registry_url${NC})"
    echo "  --mongouser <value>      set mongodb username (default: ${GREEN}$mongo_initdb_root_username${NC})"
    echo "  --mongopassword <value>  set mongodb password (default: ${GREEN}$mongo_initdb_root_password${NC})"
    echo "  --mongodatabase <value>  set mongodb database (default: ${GREEN}$mongo_initdb_database${NC})"
    echo "  --rabbitmquser <value>   set rabbitmq username (default: ${GREEN}$rabbitmq_default_user${NC})"
    echo "  --rabbitmqpassword <value> set rabbitmq password (default: ${GREEN}$rabbitmq_default_pass${NC})"
    exit 1
}

# File names
clientFile=$bppClientFile
networkFile=$bppNetworkFile

client_port=$bpp_client_port
network_port=$bpp_network_port

# Display current values
echo "Current BPP_CLIENT_PORT value is set to 6001."

# Prompt user for BPP_CLIENT_PORT value
read -p "Do you want to change the BPP_CLIENT_PORT value? (y/n): " changeClientPort
if [[ "${changeClientPort,,}" == "yes" || "${changeClientPort,,}" == "y" ]]; then
    read -p "Enter new BPP_CLIENT_PORT value: " newClientPort\
    client_port=$newClientPort
    # sed -i "s/BPP_CLIENT_PORT/$newClientPort/" $clientFile
    # echo "BPP_CLIENT_PORT value updated to $newClientPort."
else
    echo "Keeping the default BPP_CLIENT_PORT value."
fi

# Display current values
echo "Current BPP_NETWORK_PORT value is set to 6002."

# Prompt user for BPP_NETWORK_PORT value
read -p "Do you want to change the BPP_NETWORK_PORT value? (y/n): " changeNetworkPort

if [[ "${changeNetworkPort,,}" == "yes" || "${changeNetworkPort,,}" == "y" ]]; then
    read -p "Enter new BPP_NETWORK_PORT value: " newNetworkPort
    network_port=$newNetworkPort
    # sed -i "s/BPP_CLIENT_PORT/$newNetworkPort/" $clientFile
    # echo "BPP_NETWORK_PORT value updated to $newNetworkPort."
else
    echo "Keeping the default BPP_NETWORK_PORT value."
fi


sed -i "s/BPP_CLIENT_PORT/$client_port/g; s/BPP_NETWORK_PORT/$network_port/g" "$clientFile" "$HOME/deploy-bpp.sh" "$networkFile"

# Ask user about Redis and RabbitMQ configurations
read -p "Is Redis running on the same instance? (y/n): " redisSameInstance
if [[ "${redisSameInstance,,}" == "no" || "${redisSameInstance,,}" == "n" ]]; then
    read -p "Enter the private IP or URL for Redis: " redisUrl
else
    redisUrl="0.0.0.0"
fi

read -p "Is RabbitMQ running on the same instance? (y/n): " rabbitmqSameInstance
if [[ "${rabbitmqSameInstance,,}" == "no" || "${rabbitmqSameInstance,,}" == "n" ]]; then
    read -p "${YELLOW}Enter the private IP or URL for RabbitMQ: ${NC}" rabbitmqUrl
    read -p "${YELLOW}Enter the RabbitMQ Username (default: $rabbitmq_default_user): ${NC}" rabbitmq_default_user
    read -p "${YELLOW}Enter the RabbitMQ Password (default: $rabbitmq_default_pass): ${NC}" rabbitmq_default_pass
else
    rabbitmqUrl="0.0.0.0"
fi

read -p "Is MonogDB running on the same instance? (y/n): " mongoSameInstance
if [[ "${mongoSameInstance,,}" == "no" || "${mongoSameInstance,,}" == "n" ]]; then
    read -p "${YELLOW}Enter the private IP or URL for MonogDB: ${NC}" mongoUrl
    read -p "${YELLOW}Enter the MonogDB Root Username (default: $mongo_initdb_root_username): ${NC}" mongo_initdb_root_username
    read -p "${YELLOW}Enter the MonogDB Root Password (default: $mongo_initdb_root_password): ${NC}" mongo_initdb_root_password
    read -p "${YELLOW}Enter the MonogDB Database Name (default: $mongo_initdb_database):: ${NC}" mongo_initdb_database
else
    mongoUrl="0.0.0.0"
fi

install_package nodejs && install_package npm
npm install
get_keys
echo "Your Private Key: $private_key" 
echo "Your Public Key: $public_key"
remove_package nodejs && remove_package npm

valid_from=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
valid_until=$(date -u -d "+1 year" +"%Y-%m-%dT%H:%M:%S.%3NZ")
type=BPP

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --mongo_initdb_root_username)
            mongo_initdb_root_username="$2"
            shift 2
            ;;
        --mongo_initdb_root_password)
            mongo_initdb_root_password="$2"
            shift 2
            ;;
        --mongo_initdb_database)
            mongo_initdb_database="$2"
            shift 2
            ;;
        --rabbitmq_default_user)
            rabbitmq_default_user="$2"
            shift 2
            ;;
        --rabbitmq_default_pass)
            rabbitmq_default_pass="$2"
            shift 2
            ;;
        --rabbitmqUrl)
            rabbitmqUrl="$2"
            shift 2
            ;;
        --bpp_subscriber_id)
            if [ -n "$2" ]; then
                bpp_subscriber_id="$2"
                bpp_subscriber_id_key="$2-key"
                shift 2
            else
                echo "error: --bpp_subscriber_id requires a non-empty option argument."
                exit 1
            fi
            ;;
        --registry_url)
            if [ -n "$2" ]; then
                registry_url="$2"
                shift 2
            else
                echo "error: --registry_url requires a non-empty option argument."
                exit 1
            fi
            ;;             
        --bpp_subscriber_url)
            if [ -n "$2" ]; then
                bpp_subscriber_url="$2"
                shift 2
            else
                echo "error: --bpp_subscriber_url requires a non-empty option argument."
                exit 1
            fi
            ;;
        *)
            echo "error: Unknown option $1"
            exit 1
            ;;
    esac
done

# Define an associative array for replacements
declare -A replacements=(
    ["REDIS_URL"]=$redisUrl
    ["REGISTRY_URL"]=$registry_url
    ["MONGO_USERNAME"]=$mongo_initdb_root_username
    ["MONGO_PASSWORD"]=$mongo_initdb_root_password
    ["MONGO_DB_NAME"]=$mongo_initdb_database
    ["MONOG_URL"]=$mongoUrl
    ["RABBITMQ_USERNAME"]=$rabbitmq_default_user
    ["RABBITMQ_PASSWORD"]=$rabbitmq_default_pass
    ["RABBITMQ_URL"]=$rabbitmqUrl
    ["PRIVATE_KEY"]=$private_key
    ["PUBLIC_KEY"]=$public_key
    ["BPP_SUBSCRIBER_ID"]=$bpp_subscriber_id
    ["SUBSCRIBER_URL"]=$$bpp_subscriber_url
    ["BPP_SUBSCRIBER_ID_KEY"]=$bpp_subscriber_id_key
)

# Apply replacements in both files
for file in "$clientFile" "$networkFile"; do
    for key in "${!replacements[@]}"; do
        sed -i "s|$key|${replacements[$key]}|" "$file"
    done
done

if [ -z "$bpp_subscriber_id" ] || [ -z "$bpp_subscriber_url" ]; then
    echo "error: Both --bpp_subscriber_id and --bpp_subscriber_url must be provided."
    exit 1
fi

create_network_participant "$registry_url" "application/json" "$bpp_subscriber_id" "$bpp_subscriber_id_key" "$bpp_subscriber_url" "$public_key" "$public_key" "$valid_from" "$valid_until" "$type"
$HOME/./deploy-bpp.sh