#!/bin/bash

# File names
clientFile="path/to/your/bap_client.yaml"
networkFile="path/to/your/bap_network.yaml"

# Display current values
echo "Current BAP_CLIENT_PORT value is set to 5001."

# Prompt user for BAP_CLIENT_PORT value
read -p "Do you want to change the BAP_CLIENT_PORT value? (y/n): " changeClientPort
if [[ "${changeClientPort,,}" == "yes" || "${changeClientPort,,}" == "y"]]; then
    read -p "Enter new BAP_CLIENT_PORT value: " newClientPort
    sed -i "s/BAP_CLIENT_PORT/$newClientPort/" $clientFile
    echo "BAP_CLIENT_PORT value updated to $newClientPort."
else
    echo "Keeping the default BAP_CLIENT_PORT value."
fi

# Display current values
echo "Current BAP_NETWORK_PORT value is set to 5002."

# Prompt user for BAP_NETWORK_PORT value
read -p "Do you want to change the BAP_NETWORK_PORT value? (y/n): " changeNetworkPort

if [[ "${changeNetworkPort,,}" == "yes" || "${changeNetworkPort,,}" == "y"]]; then
    read -p "Enter new BAP_NETWORK_PORT value: " newNetworkPort
    sed -i "s/BAP_NETWORK_PORT/$newNetworkPort/" $networkFile
    echo "BAP_NETWORK_PORT value updated to $newNetworkPort."
else
    echo "Keeping the default BAP_NETWORK_PORT value."
fi

# Ask user about Redis and RabbitMQ configurations
read -p "Is Redis running on the same instance? (y/n): " redisSameInstance
if [[ "${redisSameInstance,,}" == "yes" || "${redisSameInstance,,}" == "y"]]; then
    read -p "Enter the private IP or URL for Redis: " redisUrl
else
    redisUrl="0.0.0.0"
fi

read -p "Is RabbitMQ running on the same instance? (y/n): " rabbitmqSameInstance
if [[ "${rabbitmqSameInstance,,}" == "yes" || "${rabbitmqSameInstance,,}" == "y"]]; then
    read -p "Enter the private IP or URL for RabbitMQ: " rabbitmqUrl
else
    rabbitmqUrl="0.0.0.0"
fi

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
        --private_key)
            private_key="$2"
            shift 2
            ;;
        --public_key)
            public_key="$2"
            shift 2
            ;;
        --bap_subscriber_id)
            bap_subscriber_id="$2"
            shift 2
            ;;
        --subscriber_url)
            subscriber_url="$2"
            shift 2
            ;;
        --bap_subscriber_id_key)
            bap_subscriber_id_key="$2"
            shift 2
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
    ["RABBITMQ_USERNAME"]=$rabbitmq_default_user
    ["RABBITMQ_PASSWORD"]=$rabbitmq_default_pass
    ["RABBITMQ_URL"]=$rabbitmqUrl
    ["PRIVATE_KEY"]=$private_key
    ["PUBLIC_KEY"]=$public_key
    ["BAP_SUBSCRIBER_ID"]=$bap_subscriber_id
    ["SUBSCRIBER_URL"]=$subscriber_url
    ["BAP_SUBSCRIBER_ID_KEY"]=$bap_subscriber_id_key
)

# Apply replacements in both files
for file in "$clientFile" "$networkFile"; do
    for key in "${!replacements[@]}"; do
        sed -i "s/$key/${replacements[$key]}/" "$file"
    done
done