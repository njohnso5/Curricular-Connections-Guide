#!/bin/bash

# Function to display script usage
display_usage() {
    echo "Usage: $0 [--build] [--env] [-d]"
    echo "  --build   Build Docker images before starting the containers (optional)"
    echo "  --env     Create .env file with environment variables and secure passwords (optional)"
    echo "  -d        Run containers in detached mode (optional)"
    echo "  --usage   Display usage information (optional)"
    exit 1
}

# Function to generate a random password
generate_password() {
    < /dev/urandom tr -dc A-Za-z0-9 | head -c16
}

# Set default options to false
BUILD=false
CREATE_ENV=false
DETACHED=false

# Process command line arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --build)
            BUILD=true
            ;;
        --env)
            CREATE_ENV=true
            ;;
        -d)
            DETACHED=true
            ;;
        --usage)
            display_usage
            ;;
    esac
    shift
done

# Create .env file if --env flag is set
if [ "$CREATE_ENV" = true ]; then
    echo "MYSQL_USER=myuser" > .env
    echo "MYSQL_PASSWORD=$(generate_password)" >> .env
    echo "MYSQL_ROOT_PASSWORD=$(generate_password)" >> .env
    echo "MYSQL_DATABASE=mydatabase" >> .env
    echo "MYSQL_HOST=database" >> .env
    echo "SECRET_KEY=$(generate_password)" >> .env
    echo "EMAIL_ADDRESS=testappemail123321123321@gmail.com" >> .env
    echo "EMAIL_PASSWORD=xnna kllc pltu yfkp" >> .env
fi

# Run docker-compose with or without build and/or detached mode based on arguments
if [ "$BUILD" = true ] && [ "$DETACHED" = true ]; then
    echo BUILDING DOCKER CONTAINERS
    echo RUNNING DOCKER IN DETACHED STATE
    echo RUN docker compose down to stop containers
    docker compose up --build -d
elif [ "$BUILD" = true ]; then
    echo BUILDING DOCKER CONTAINERS
    echo RUNNING DOCKER - CTRL-C to exit
    docker compose up --build
elif [ "$DETACHED" = true ]; then
    echo RUNNING DOCKER IN DETACHED STATE
    echo RUN docker compose down to stop containers
    docker compose up -d
else
    echo RUNNING DOCKER - CTRL-C to exit
    docker compose up
fi
