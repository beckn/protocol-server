#!/bin/bash

source variables.sh
source package_manager.sh

# Function to display help
display_help() {
    # Define color codes
    echo "${YELLOW}usage: $0 [options]${NC}"
    echo "${GREEN}options:${NC}"
    echo "  --help${NC}                   display this help message"
    echo "  ${RED}--bap_subscriber_id <value>${NC}   set bap_subscriber_id ${RED}(required)${NC}"
    echo "  ${RED}--bap_subscriber_url <value>${NC}  set bap_subscriber_url ${RED}(required)${NC}"
    echo "  ${RED}--bpp_subscriber_id <value>${NC}   set bpp_subscriber_id ${RED}(required if setting up on same server)${NC}"
    echo "  ${RED}--bpp_subscriber_url <value>${NC}  set bpp_subscriber_url ${RED}(required if setting up on same server)${NC}"
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

# Function to install required packages
install_required_package() {
    ./package_manager.sh
}

# Function to update the Docker Compose file
update_docker_compose() {
    docker_dir="$HOME/docker_data"
    local docker_compose_file="$HOME/docker_data/docker-compose.yaml"
    if [ ! $docker_dir ]; then
        mkdir $HOME/docker_data && cp docker/docker-compose.yaml $HOME/docker_data/
    fi
    # Check if the docker-compose file exists
    if [ ! -f "$docker_compose_file" ]; then
        echo "${RED}error: docker-compose file not found at $docker_compose_file.${NC}"
        exit 1
    else
        echo "Updating docker-compose file"
        # Update values in the docker-compose file
        sed -i "s/MONGO_INITDB_ROOT_USERNAME=.*/MONGO_INITDB_ROOT_USERNAME=$mongo_initdb_root_username/" "$docker_compose_file"
        sed -i "s/MONGO_INITDB_ROOT_PASSWORD=.*/MONGO_INITDB_ROOT_PASSWORD=$mongo_initdb_root_password/" "$docker_compose_file"
        sed -i "s/MONGO_INITDB_DATABASE=.*/MONGO_INITDB_DATABASE=$mongo_initdb_database/" "$docker_compose_file"
        sed -i "s/RABBITMQ_DEFAULT_USER=.*/RABBITMQ_DEFAULT_USER=$rabbitmq_default_user/" "$docker_compose_file"
        sed -i "s/RABBITMQ_DEFAULT_PASS=.*/RABBITMQ_DEFAULT_PASS=$rabbitmq_default_pass/" "$docker_compose_file"
        echo "docker-compose file updated with new values."
    fi
}

# Function to bring up Docker Compose services
docker_compose_up() {
    cd $HOME/docker_data/
    sudo docker-compose up -d
    cd -
}

# Function to copy BAP files
copy_bap_files() {
    ./copy_bap_files.sh
}

# Function to copy BPP files
copy_bpp_files() {
    ./copy_bpp_files.sh
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
    --bap_subscriber_id "$bap_subscriber_id" \
    --bap_subscriber_url "$bap_subscriber_url"
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
    --bpp_subscriber_id "$bpp_subscriber_id" \
    --bpp_subscriber_url "$bpp_subscriber_url"
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
        --bap_subscriber_url)
            if [ -n "$2" ]; then
                bap_subscriber_url="$2"
                shift 2
            else
                echo "error: --bap_subscriber_url requires a non-empty option argument."
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
                echo "${RED}error: --mongopassword requires a non-empty option argument.${NC}"
                exit 1
            fi
            ;;
        --mongodatabase)
            if [ -n "$2" ]; then
                mongo_initdb_database="$2"
                shift 2
            else
                echo "${RED}error: --mongodatabase requires a non-empty option argument.${NC}"
                exit 1
            fi
            ;;
        --rabbitmquser)
            if [ -n "$2" ]; then
                rabbitmq_default_user="$2"
                shift 2
            else
                echo "${RED}error: --rabbitmquser requires a non-empty option argument.${NC}"
                exit 1
            fi
            ;;
        --rabbitmqpassword)
            if [ -n "$2" ]; then
                rabbitmq_default_pass="$2"
                shift 2
            else
                echo "${RED}error: --rabbitmqpassword requires a non-empty option argument.${NC}"
                exit 1
            fi
            ;;
        --help)
            display_help
            ;;
        *)
            echo "${RED}error: unknown option: $1${NC}"
            display_help
            ;;
    esac
done

# Check if required parameters are set
if [ -z "$bap_subscriber_id" ] || [ -z "$bap_subscriber_url" ]; then
    echo "${RED}error: --bap_subscriber_id and --bap_subscriber_url are required parameters.${NC}"
    display_help
fi

display_values(){
# Display configured values
echo "${GREEN}configured values:"
echo "  registry_url: $registry_url"
echo "  mongo_initdb_root_username: $mongo_initdb_root_username"
echo "  mongo_initdb_root_password: $mongo_initdb_root_password"
echo "  mongo_initdb_database: $mongo_initdb_database"
echo "  rabbitmq_default_user: $rabbitmq_default_user"
echo "  rabbitmq_default_pass: $rabbitmq_default_pass"
}
display_values

read -p "${YELLOW}Do you want to change the default values of Registry URL, MongoDB Username, Password, and Database, as well as RabbitMQ Username and Password? (yes/no): ${NC}" change_defaults

if [[ "${change_defaults,,}" == "yes" || "${change_defaults,,}" == "y" ]]; then
    # Ask for new values and update variables
    read -p "Enter new Registry URL (default: $registry_url): " registry_url
    read -p "Enter new MongoDB Username (default: $mongo_initdb_root_username): " mongo_initdb_root_username
    read -p "Enter new MongoDB Password (default: $mongo_initdb_root_password): " mongo_initdb_root_password
    read -p "Enter new MongoDB Database (default: $mongo_initdb_database): " mongo_initdb_database
    read -p "Enter new RabbitMQ Username (default: $rabbitmq_default_user): " rabbitmq_default_user
    read -p "Enter new RabbitMQ Password (default: $rabbitmq_default_pass): " rabbitmq_default_pass
    #Deipla Updated Values
    display_values
fi



# Ask if BAP and BPP should be set up on the same server
read -p "Do you want to set up BPP on the same server? (yes/no): " setup_bpp_same_server
if [[ "${setup_bpp_same_server,,}" == "yes" || "${setup_bpp_same_server,,}" == "y" ]]; then
    # Accept input for --bpp_subscriber_id and --bpp_subscriber_url
    read -p "${YELLOW}Enter BPP Subscriber ID: ${NC}" bpp_subscriber_id
    read -p "${YELLOW}Enter BPP Subscriber URI: ${NC}" bpp_subscriber_url
fi

# Install Docker and related components
install_required_package
update_docker_compose

# Bring up Docker Compose services
docker_compose_up || { echo "${RED}Error: Docker Compose failed. Exiting.${NC}"; exit 1; }

# Copy BAP and BPP files
copy_bap_files


# Update default BAP configuration
update_default_bap

# Call update functions only if BAP and BPP are set up on the same server
if [[ "${setup_bpp_same_server,,}" == "yes" || "${setup_bpp_same_server,,}" == "y" ]]; then
    copy_bpp_files
    update_default_bpp
fi
