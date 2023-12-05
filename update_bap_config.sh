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
    echo "  ${RED}--bap_subscriber_id <value>${NC}   set bap_subscriber_id ${RED}(required)${NC}"
    echo "  ${RED}--bap_subscriber_uri <value>${NC}  set bap_subscriber_uri ${RED}(required)${NC}"
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

clientFile=$bapClientFile
networkFile=$bapNetworkFile

client_port=$bap_client_port
network_port=$bap_network_port


# Display current values
echo "Current BAP_CLIENT_PORT value is set to 5001."

# Prompt user for BAP_CLIENT_PORT value
read -p "Do you want to change the BAP_CLIENT_PORT value? (y/n): " changeClientPort
if [[ "${changeClientPort,,}" == "yes" || "${changeClientPort,,}" == "y" ]]; then
    read -p "Enter new BAP_CLIENT_PORT value: " newClientPort
    client_port=$newClientPort
else
    echo "Keeping the default BAP_CLIENT_PORT value."
fi

# Display current values
echo "Current BAP_NETWORK_PORT value is set to 5002."

# Prompt user for BAP_NETWORK_PORT value
read -p "Do you want to change the BAP_NETWORK_PORT value? (y/n): " changeNetworkPort

if [[ "${changeNetworkPort,,}" == "yes" || "${changeNetworkPort,,}" == "y" ]]; then
    read -p "Enter new BAP_NETWORK_PORT value: " newNetworkPort
    network_port=$newNetworkPort
else
    echo "${GREEN}Keeping the default BAP_NETWORK_PORT value.${NC}"
fi

sed -i "s/BAP_CLIENT_PORT/$client_port/g; s/BAP_NETWORK_PORT/$network_port/g" "$clientFile" "$HOME/deploy-bap.sh" "$networkFile"

# Ask user about Redis and RabbitMQ configurations
read -p "Is Redis running on the same instance? (y/n): " redisSameInstance
if [[ "${redisSameInstance,,}" == "no" || "${redisSameInstance,,}" == "n" ]]; then
    read -p "${YELLOW}Enter the private IP or URL for Redis: ${NC}" redisUrl
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
type=BAP


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
        --bap_subscriber_id)
            if [ -n "$2" ]; then
                bap_subscriber_id="$2"
                bap_subscriber_id_key="$2-key"
                shift 2
            else
                echo "${RED}error: --subscriber_id requires a non-empty option argument.${NC}"
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
        --bap_subscriber_url)
            if [ -n "$2" ]; then
                bap_subscriber_url="$2"
                shift 2
            else
                echo "${RED}error: --bap_subscriber_url requires a non-empty option argument.${NC}"
                exit 1
            fi
            ;;
        *)
            echo "${RED}error: Unknown option $1${NC}"
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
    ["BAP_SUBSCRIBER_ID"]=$bap_subscriber_id
    ["BAP_SUBSCRIBER_URL"]=$bap_subscriber_url
    ["BAP_SUBSCRIBER_ID_KEY"]=$bap_subscriber_id_key
)

# Apply replacements in both files
for file in "$clientFile" "$networkFile"; do
    for key in "${!replacements[@]}"; do
        sed -i "s|$key|${replacements[$key]}|" "$file"
    done
done

if [ -z "$bap_subscriber_id" ] || [ -z "$bap_subscriber_url" ]; then
    echo "${RED}error: Both --subscriber_id and --bap_subscriber_url must be provided. ${NC}"
    exit 1
fi

create_network_participant "$registry_url" "application/json" "$bap_subscriber_id" "$bap_subscriber_id_key" "$bap_subscriber_url" "$public_key" "$public_key" "$valid_from" "$valid_until" "$type"
$HOME/./deploy-bap.sh