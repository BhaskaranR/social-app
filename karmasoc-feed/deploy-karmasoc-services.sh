# file configurations
DEPLOYMENT_PATH=/home/ec2-user/
SERVICE_FOLDER_NAME=karmasoc_services
FILE_SEPARATOR=/
DOCKER_COMPOSE_FILE=docker-compose.yml
IMAGE_NAME=karmasoc-feed
SERVICE_DEPLOYMENT_FOLDER=$DEPLOYMENT_PATH$SERVICE_FOLDER_NAME
# make directory for setup folder
rm -rf $SERVICE_DEPLOYMENT_FOLDER
mkdir $SERVICE_DEPLOYMENT_FOLDER
# git clone setup
git clone https://sasikumar-sugumar:shoe1dog@github.com/KarmaSoc/setup.git $SERVICE_DEPLOYMENT_FOLDER
cd $SERVICE_DEPLOYMENT_FOLDER

# clone all services
git clone https://sasikumar-sugumar:shoe1dog@github.com/KarmaSoc/karmasoc-user.git 
git clone https://sasikumar-sugumar:shoe1dog@github.com/KarmaSoc/karmasoc-posts.git 
git clone https://sasikumar-sugumar:shoe1dog@github.com/KarmaSoc/karmasoc-mediaserve.git 
git clone https://sasikumar-sugumar:shoe1dog@github.com/KarmaSoc/karmasoc-notifications.git 

# start docker container using docker-compose
docker-compose -f $SERVICE_DEPLOYMENT_FOLDER$FILE_SEPARATOR$DOCKER_COMPOSE_FILE build
docker-compose -f $SERVICE_DEPLOYMENT_FOLDER$FILE_SEPARATOR$DOCKER_COMPOSE_FILE up -d




