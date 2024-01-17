# 2023FallTeam01-Arts
requirements.txt specifies flask's dependencies

## run to build the docker image
docker build . -t IMAGE_NAME 

## Run to start the container and make the api accessable through port 8080
docker run --publish 8080:8080 IMAGE_NAME
