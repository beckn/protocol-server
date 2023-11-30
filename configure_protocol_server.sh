#!/bin/bash

# Default values
mongo_initdb_root_username="beckn"
mongo_initdb_root_password="beckn123"
mongo_initdb_database="protocol_server"
rabbitmq_default_user="beckn"
rabbitmq_default_pass="beckn123"
registry_url="https://registry.becknprotocol.io/subscribers"

# Function to display help
display_help() {
    # Define color codes
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    NC=$(tput sgr0)

    echo "${YELLOW}usage: $0 [options]${NC}"
    echo "${GREEN}options:${NC}"
    echo "  --help${NC}                   display this help message"
    echo "  ${RED}--bap_subscriber_id <value>${NC}   set bap_subscriber_id ${RED}(required)${NC}"
    echo "  ${RED}--bap_subscriber_uri <value>${NC}  set bap_subscriber_uri ${RED}(required)${NC}"
    echo "  ${RED}--bpp_subscriber_id <value>${NC}   set bpp_subscriber_id ${RED}(required if setting up on same server)${NC}"
    echo "  ${RED}--bpp_subscriber_uri <value>${NC}  set bpp_subscriber_uri ${RED}(required if setting up on same server)${NC}"
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

# Function to install Docker
install_docker() {
    # Below script will install docker, docker-compose, nginx, and certbot on the user's system
    sh docker_installation.sh
}

# Function to install Nginx and Certbot
install_nginx_certbot() {
    sh nginx_certbot_installation.sh
}

# Function to update the Docker Compose file
update_docker_compose() {
    local docker_compose_file="$home/docker_data/docker-compose.yaml"

    # Check if the docker-compose file exists
    if [ ! -f "$docker_compose_file" ]; then
        echo "error: docker-compose file not found at $docker_compose_file."
        exit 1
    else
        echo "Updating docker-compose file"
    fi

    # Update values in the docker-compose file
    sed -i "s/MONGO_INITDB_ROOT_USERNAME=.*/MONGO_INITDB_ROOT_USERNAME= $mongo_initdb_root_username/" "$docker_compose_file"
    sed -i "s/MONGO_INITDB_ROOT_PASSWORD=.*/MONGO_INITDB_ROOT_PASSWORD= $mongo_initdb_root_password/" "$docker_compose_file"
    sed -i "s/MONGO_INITDB_DATABASE=.*/MONGO_INITDB_DATABASE= $mongo_initdb_database/" "$docker_compose_file"
    sed -i "s/RABBITMQ_DEFAULT_USER=.*/RABBITMQ_DEFAULT_USER= $rabbitmq_default_user/" "$docker_compose_file"
    sed -i "s/RABBITMQ_DEFAULT_PASS=.*/RABBITMQ_DEFAULT_PASS= $rabbitmq_default_pass/" "$docker_compose_file"

    echo "docker-compose file updated with new values."
}

# Function to bring up Docker Compose services
docker_compose_up() {
    mkdir ~/docker_data && cp docker/docker-compose.yaml ~/docker_data/
    cd $home/docker_data/
    docker-compose up -d
}

# Function to copy BAP files
copy_bap_files() {
    sh copy_bap_files.sh
}

# Function to copy BPP files
copy_bpp_files() {
    sh copy_bpp_files.sh
}

# Function to update default BAP configuration
update_default_bap() {
    ./update_bap_config.sh \
    --mongo_initdb_root_username "$mongo_initdb_root_username" \
    --mongo_initdb_root_password "$mongo_initdb_root_password" \
    --mongo_initdb_database "$mongo_initdb_database" \
    --rabbitmq_default_user "$rabbitmq_default_user" \
    --rabbitmq_default_pass "$rabbitmq_default_pass" \
    --rabbitmqUrl "$rabbitmqUrl" \
    --private_key "$private_key" \
    --public_key "$public_key" \
    --bap_subscriber_id "$bap_subscriber_id" \
    --bap_subscriber_url "$bap_subscriber_url" \
    --bap_subscriber_id_key "$bap_subscriber_id_key"
}

# Function to update default BPP configuration
update_default_bpp() {
    ./update_bpp_config.sh \
    --mongo_initdb_root_username "$mongo_initdb_root_username" \
    --mongo_initdb_root_password "$mongo_initdb_root_password" \
    --mongo_initdb_database "$mongo_initdb_database" \
    --rabbitmq_default_user "$rabbitmq_default_user" \
    --rabbitmq_default_pass "$rabbitmq_default_pass" \
    --rabbitmqUrl "$rabbitmqUrl" \
    --private_key "$private_key" \
    --public_key "$public_key" \
    --bpp_subscriber_id "$bpp_subscriber_id" \
    --bpp_subscriber_url "$bpp_subscriber_url" \
    --bpp_subscriber_id_key "$bpp_subscriber_id_key"
}

# Process command line options
while [ "$#" -gt 0 ]; do
    case "$1" in
        --bap_subscriber_id)
            if [ -n "$2" ]; then
                bap_subscriber_id="$2"
                bap_subscriber_id_key="$2-key"
                shift 2
            else
                echo "error: --bap_subscriber_id requires a non-empty option argument."
                exit 1
            fi
            ;;
        --bap_subscriber_uri)
            if [ -n "$2" ]; then
                bap_subscriber_uri="$2"
                shift 2
            else
                echo "error: --bap_subscriber_uri requires a non-empty option argument."
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
        --mongouser)
            if [ -n "$2" ]; then
                mongo_initdb_root_username="$2"
                shift 2
            else
                echo "error: --mongouser requires a non-empty option argument."
                exit 1
            fi
            ;;
        --mongopassword)
            if [ -n "$2" ]; then
                mongo_initdb_root_password="$2"
                shift 2
            else
                echo "error: --mongopassword requires a non-empty option argument."
                exit 1
            fi
            ;;
        --mongodatabase)
            if [ -n "$2" ]; then
                mongo_initdb_database="$2"
                shift 2
            else
                echo "error: --mongodatabase requires a non-empty option argument."
                exit 1
            fi
            ;;
        --rabbitmquser)
            if [ -n "$2" ]; then
                rabbitmq_default_user="$2"
                shift 2
            else
                echo "error: --rabbitmquser requires a non-empty option argument."
                exit 1
            fi
            ;;
        --rabbitmqpassword)
            if [ -n "$2" ]; then
                rabbitmq_default_pass="$2"
                shift 2
            else
                echo "error: --rabbitmqpassword requires a non-empty option argument."
                exit 1
            fi
            ;;
        --help)
            display_help
            ;;
        *)
            echo "error: unknown option: $1"
            display_help
            ;;
    esac
done

# Check if required parameters are set
if [ -z "$bap_subscriber_id" ] || [ -z "$bap_subscriber_uri" ]; then
    echo "error: --bap_subscriber_id and --bap_subscriber_uri are required parameters."
    display_help
fi

# Display configured values
echo "configured values:"
echo "  mongo_initdb_root_username: $mongo_initdb_root_username"
echo "  mongo_initdb_root_password: $mongo_initdb_root_password"
echo "  mongo_initdb_database: $mongo_initdb_database"
echo "  rabbitmq_default_user: $rabbitmq_default_user"
echo "  rabbitmq_default_pass: $rabbitmq_default_pass"
echo "  registry_url: $registry_url"
echo "  bap_subscriber_id: $bap_subscriber_id"
echo "  subscriber_uri: $bap_subscriber_uri"
echo "  uniquekey: $bap_subscriber_id_key"

# Ask if BAP and BPP should be set up on the same server
read -p "Do you want to set up BAP and BPP on the same server? (yes/no): " setup_bap_bpp_same_server
if [[ "${setup_bap_bpp_same_server,,}" == "yes" || "${setup_bap_bpp_same_server,,}" == "y" ]]; then
    # Accept input for --bpp_subscriber_id and --bpp_subscriber_uri
    read -p "Enter BPP Subscriber ID: " bpp_subscriber_id
    read -p "Enter BPP Subscriber URI: " bpp_subscriber_uri
fi

# Install Docker and related components
install_docker
install_nginx_certbot
update_docker_compose

# Bring up Docker Compose services
docker_compose_up || { echo "Error: Docker Compose failed. Exiting."; exit 1; }

# Copy BAP and BPP files
copy_bap_files
copy_bpp_files

# Update default BAP configuration
update_default_bap

# Call update functions only if BAP and BPP are set up on the same server
if [[ "${setup_bap_bpp_same_server,,}" == "yes" || "${setup_bap_bpp_same_server,,}" == "y" ]]; then
    update_default_bpp
fi
