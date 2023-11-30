#!/bin/bash

# Function to check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        echo "Docker is already installed."
        return 0
    else
        echo "Docker is not installed."
        return 1
    fi
}

# Function to install Docker
install_docker() {
    echo "Installing Docker..."

    # Check the system package manager and install Docker accordingly
    if [ -x "$(command -v apt-get)" ]; then
        # APT (Debian/Ubuntu)
        sudo apt-get update
        sudo apt-get install -y docker.io
    elif [ -x "$(command -v yum)" ]; then
        # YUM (Red Hat/CentOS)
        sudo yum install -y docker
    elif [ -x "$(command -v amazon-linux-extras)" ]; then
        # Amazon Linux 2
        sudo amazon-linux-extras install docker
        sudo service docker start
    else
        echo "Unsupported package manager. Please install Docker manually."
        exit 1
    fi
    sleep 10
    sudo systemctl enable docker.service
    sudo systemctl restart docker.service
    sudo usermod -a -G docker $USER

    # Check if Docker installation was successful
    if [ $? -eq 0 ]; then
        echo "Docker installed successfully."
    else
        echo "Failed to install Docker. Exiting."
        exit 1
    fi

    # Install Docker Bash completion
    if [ -f /etc/bash_completion.d/docker ]; then
        echo "Docker Bash completion is already installed."
    else
        # Install Docker Bash completion
        echo "Installing Docker Bash completion..."
        sudo curl -L https://raw.githubusercontent.com/docker/cli/master/contrib/completion/bash/docker -o /etc/bash_completion.d/docker
    fi
}

# Function to install Docker Compose
install_docker_compose() {
    echo "Installing Docker Compose..."
    # Add any installation steps specific to Docker Compose
    # Follow the official Docker Compose installation guide: https://docs.docker.com/compose/install/

    # Example installation for Linux
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Check if Docker Compose installation was successful
    if [ $? -eq 0 ]; then
        echo "Docker Compose installed successfully."
    else
        echo "Failed to install Docker Compose. Exiting."
        exit 1
    fi

    if [ -f /etc/bash_completion.d/docker-compose ]; then
        echo "Docker Compose Bash completion is already installed."
    else
        # Install Docker Compose Bash completion
        echo "Installing Docker Compose Bash completion..."
        sudo curl -L https://raw.githubusercontent.com/docker/compose/master/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
    fi
}


# Check if Docker is already installed
check_docker

# Install Docker if not installed
if [ $? -ne 0 ]; then
    install_docker
fi

# Install Docker Compose
install_docker_compose

