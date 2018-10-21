DOCKER_FILE=Dockerfile.notification
IMAGE_NAME=karmsoc-notification
REMOTE_IMAGE_URL=karmasoc/$IMAGE_NAME
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

