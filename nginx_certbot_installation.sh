#!/bin/bash

# Function to install Nginx and Certbot
install_nginx_certbot() {
    echo "Installing Nginx and Certbot..."
    # Check the system package manager and install Nginx and Certbot accordingly
    if [ -x "$(command -v apt-get)" ]; then
        # APT (Debian/Ubuntu)
        sudo apt-get update
        sudo apt-get install -y nginx certbot python3-certbot-nginx jq
    elif [ -x "$(command -v yum)" ]; then
        # YUM (Red Hat/CentOS)
        sudo yum install -y nginx certbot jq
    elif [ -x "$(command -v amazon-linux-extras)" ]; then
        # Amazon Linux 2
        sudo amazon-linux-extras install nginx1.12
        sudo yum install -y certbot jq
    else
        echo "Unsupported package manager. Please install Nginx and Certbot manually."
        exit 1
    fi

    # Check if Nginx and Certbot installation was successful
    if [ $? -eq 0 ]; then
        echo "Nginx and Certbot installed successfully."
    else
        echo "Failed to install Nginx and Certbot. Exiting."
        exit 1
    fi
}



if [ -z "$(command -v nginx)" ] || [ -z "$(command -v certbot)" ]; then
    install_nginx_certbot
fi

echo "Nginx and Certbot are installed skipping installation"