#!/bin/bash

source registry_entry.sh
# File names
clientFile="$HOME/default-bap-client.yml"
networkFile="$HOME/default-bap-network.yml"

client_port=5001
network_port=5002

mongo_initdb_root_username="beckn"
mongo_initdb_root_password="beckn123"
mongo_initdb_database="protocol_server"
rabbitmq_default_user="beckn"
rabbitmq_default_pass="beckn123"
registry_url="https://registry.becknprotocol.io/subscribers"

# Display current values
echo "Current BAP_CLIENT_PORT value is set to 5001."

# Prompt user for BAP_CLIENT_PORT value
read -p "Do you want to change the BAP_CLIENT_PORT value? (y/n): " changeClientPort
if [[ "${changeClientPort,,}" == "yes" || "${changeClientPort,,}" == "y" ]]; then
    read -p "Enter new BAP_CLIENT_PORT value: " newClientPort
    client_port=$newClientPort
    # sed -i "s/BAP_CLIENT_PORT/$newClientPort/" $clientFile
    # echo "BAP_CLIENT_PORT value updated to $newClientPort."
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
    sed -i "s/BAP_NETWORK_PORT/$newNetworkPort/" $networkFile
    echo "BAP_NETWORK_PORT value updated to $newNetworkPort."
else
    echo "Keeping the default BAP_NETWORK_PORT value."
fi

sed -i "s/BAP_CLIENT_PORT/$client_port/g; s/BAP_NETWORK_PORT/$network_port/g" "$clientFile" "$HOME/deploy-bap.sh" "networkFile"

# Ask user about Redis and RabbitMQ configurations
read -p "Is Redis running on the same instance? (y/n): " redisSameInstance
if [[ "${redisSameInstance,,}" == "no" || "${redisSameInstance,,}" == "n" ]]; then
    read -p "Enter the private IP or URL for Redis: " redisUrl
else
    redisUrl="0.0.0.0"
fi

read -p "Is RabbitMQ running on the same instance? (y/n): " rabbitmqSameInstance
if [[ "${rabbitmqSameInstance,,}" == "no" || "${rabbitmqSameInstance,,}" == "n" ]]; then
    read -p "Enter the private IP or URL for RabbitMQ: " rabbitmqUrl
else
    rabbitmqUrl="0.0.0.0"
fi

read -p "Is MonogDB running on the same instance? (y/n): " mongoSameInstance
if [[ "${mongoSameInstance,,}" == "no" || "${mongoSameInstance,,}" == "n" ]]; then
    read -p "Enter the private IP or URL for MonogDB: " mongoUrl
else
    mongoUrl="0.0.0.0"
fi

curl_response=$(curl -s https://registry-ec.becknprotocol.io/subscribers/generateEncryptionKeys)

# Check if the curl command was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to execute the curl command. Exiting."
    exit 1
else
    # Extract private_key and public_key from the JSON response
    private_key=$(echo "$curl_response" | jq -r '.private_key')
    public_key=$(echo "$curl_response" | jq -r '.public_key')
fi
echo "Private Key: $private_key" 
echo "Public Key: $public_key"

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
        --subscriber_id)
            if [ -n "$2" ]; then
                subscriber_id="$2"
                subscriber_id_key="$2-key"
                shift 2
            else
                echo "error: --subscriber_id requires a non-empty option argument."
                exit 1
            fi
            ;;
        --subscriber_uri)
            if [ -n "$2" ]; then
                subscriber_uri="$2"
                shift 2
            else
                echo "error: --subscriber_uri requires a non-empty option argument."
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
    ["MONGO_USERNAME"]=$mongo_initdb_root_username
    ["MONGO_PASSWORD"]=$mongo_initdb_root_password
    ["MONGO_DB_NAME"]=$mongo_initdb_database
    ["MONOG_URL"]=$mongoUrl
    ["RABBITMQ_USERNAME"]=$rabbitmq_default_user
    ["RABBITMQ_PASSWORD"]=$rabbitmq_default_pass
    ["RABBITMQ_URL"]=$rabbitmqUrl
    ["PRIVATE_KEY"]=$private_key
    ["PUBLIC_KEY"]=$public_key
    ["BAP_SUBSCRIBER_ID"]=$subscriber_id
    ["BAP_SUBSCRIBER_URL"]=$subscriber_uri
    ["BAP_SUBSCRIBER_ID_KEY"]=$subscriber_id_key
)

# Apply replacements in both files
for file in "$clientFile" "$networkFile"; do
    for key in "${!replacements[@]}"; do
        sed -i "s/$key/${replacements[$key]}/" "$file"
    done
done

if [ -z "$subscriber_id" ] || [ -z "$subscriber_uri" ]; then
    echo "error: Both --subscriber_id and --subscriber_uri must be provided."
    exit 1
fi

create_network_participant