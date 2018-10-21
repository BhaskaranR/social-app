DOCKER_FILE=Dockerfile.karmasocfeed
IMAGE_NAME=karmasoc-feed
REMOTE_IMAGE_URL=eurosasi/$IMAGE_NAME
git clone https://github.com/KarmaSoc/setup.git setup
mv setup/process.json .
mv setup/config .
rm -rf setup
echo "building docker image for service : $IMAGE_NAME" 
docker build --no-cache=true -f $DOCKER_FILE -t $IMAGE_NAME .
echo "Pushing $IMAGE_NAME:latest"
docker tag $IMAGE_NAME:latest "$REMOTE_IMAGE_URL:latest"
docker push "$REMOTE_IMAGE_URL:latest"
echo "Pushed $IMAGE_NAME:latest"
rm -rf process.json
rm -rf config