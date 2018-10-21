# file configurations
DEPLOYMENT_PATH=/home/ubuntu/
SERVICE_FOLDER_NAME=karmasoc_services
FILE_SEPARATOR=/
DOCKER_COMPOSE_FILE=docker-compose.k8.yml
KUBE_MANIFEST_DIR=kubernetes-manifest
SERVICE_DEPLOYMENT_FOLDER=$DEPLOYMENT_PATH$SERVICE_FOLDER_NAME
KUBE_DEPLOYMENT_FOLDER=$DEPLOYMENT_PATH$SERVICE_FOLDER_NAME/$KUBE_MANIFEST_DIR
DOCKER_USER=karmasocio
CLEAN_INSTALL=false

doCleanInstall() {
	# make directory for setup folder
	rm -rf $SERVICE_DEPLOYMENT_FOLDER
	mkdir $SERVICE_DEPLOYMENT_FOLDER
	# git clone setup
	git clone https://github.com/KarmaSoc/setup.git $SERVICE_DEPLOYMENT_FOLDER
}

doDownLoadProject() {
	PROJECT_NAME=$1
	DIR=$SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME
	REMOTE_IMAGE_URL=$DOCKER_USER/$IMAGE_NAME

	if [ ! -d "${DIR}" ]; then
		#mkdir ${DIR}
		doCleanInstall
	fi

	## clone PROJECT
	echo "Cloning Project https://github.com/KarmaSoc/$PROJECT_NAME.git"
	git clone https://github.com/KarmaSoc/$PROJECT_NAME.git $SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME
}

doBuildDockerImage() {
	PROJECT_NAME=$1
	IMAGE_NAME=$1
	REMOTE_IMAGE_URL=$DOCKER_USER/$IMAGE_NAME

	doDownLoadProject $1

	echo "Delete Current Image for  $PROJECT_NAME"
	echo "docker-compose rm -f $SERVICE_DEPLOYMENT_FOLDER$FILE_SEPARATOR$DOCKER_COMPOSE_FILE"
	docker rmi -f $REMOTE_IMAGE_URL

	##build PROJECT
	echo "Building Service $PROJECT_NAME"

	echo "docker-compose -f $SERVICE_DEPLOYMENT_FOLDER$FILE_SEPARATOR$DOCKER_COMPOSE_FILE  build $PROJECT_NAME"
	docker-compose -f $SERVICE_DEPLOYMENT_FOLDER$FILE_SEPARATOR$DOCKER_COMPOSE_FILE build $PROJECT_NAME
	echo "docker push $PROJECT_NAME"
	doPushDockerImage $PROJECT_NAME
	echo "kube deployment $PROJECT_NAME"
	doKubeCreate $PROJECT_NAME
}

doKubeCreate() {
	POD_MANIFEST_NAME=$KUBE_DEPLOYMENT_FOLDER/$1-pod-manifest.yml
	if [ ! -d "${KUBE_DEPLOYMENT_FOLDER}" ]; then
		git clone https://github.com/KarmaSoc/$KUBE_MANIFEST_DIR.git $SERVICE_DEPLOYMENT_FOLDER/$KUBE_MANIFEST_DIR
	fi
	kubectl delete -f $POD_MANIFEST_NAME
	kubectl create -f $POD_MANIFEST_NAME
	doDeleteProjectDIR $1
}

doKubeCreatePackage() {
	PROJECT_NAME=$1
	POD_MANIFEST_NAME=$KUBE_DEPLOYMENT_FOLDER/$PROJECT_NAME
	if [ ! -d "${KUBE_DEPLOYMENT_FOLDER}" ]; then
		git clone https://github.com/KarmaSoc/$KUBE_MANIFEST_DIR.git $SERVICE_DEPLOYMENT_FOLDER/$KUBE_MANIFEST_DIR
	fi
	kubectl delete -f $POD_MANIFEST_NAME
	kubectl create -f $POD_MANIFEST_NAME
}

doDeleteProjectDIR() {
	PROJECT_NAME=$1
	rm -rf $SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME
	echo "####SUCCESSFULLY DEPLOYED##### :: "$PROJECT_NAME
	exit
}

doDeleteKUBEDEPLOYMENT() {
	if [ ! -d "${KUBE_DEPLOYMENT_FOLDER}" ]; then
		git clone https://github.com/KarmaSoc/$KUBE_MANIFEST_DIR.git $SERVICE_DEPLOYMENT_FOLDER/$KUBE_MANIFEST_DIR
	fi
	kubectl delete -f $SERVICE_DEPLOYMENT_FOLDER/$KUBE_MANIFEST_DIR
}

doPushDockerImage() {
	IMAGE_NAME=$1
	REMOTE_IMAGE_URL=$DOCKER_USER/$IMAGE_NAME
	# Build and push
	# docker build -t $IMAGE_NAME .
	echo "Pushing $REMOTE_IMAGE_URL:latest"
	# docker tag $IMAGE_NAME:latest "$REMOTE_IMAGE_URL:latest"
	docker push "$REMOTE_IMAGE_URL:latest"
	echo "Pushed $IMAGE_NAME:latest"
}

doBuildAllImage() {
	doBuildNPMDist karmasoc-web
	doBuildDockerImage karmasoc-user
	doBuildDockerImage karmasoc-posts
	doBuildDockerImage ks-business
	doBuildDockerImage karmasoc-feed
	doBuildDockerImage karmasoc-web-server
	doBuildDockerImage karmasoc-mediaserve
	doBuildDockerImage karmasoc-notifications
	doBuildDockerImage karmasoc-emailer
	doBuildDockerImage karmasoc-app
	doBuildDockerImage ks-reporter
	doBuildRabbitMQImage karmasoc-rabbitmq

}
doBuildNPMDist() {
	PROJECT_NAME=$1
	doDownLoadProject $1
	DIR=$SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME
	BUILD_SCRIPT=$SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME/build-$PROJECT_NAME-dist.sh
	chmod 777 $BUILD_SCRIPT
	$BUILD_SCRIPT
	doBuildDockerImage $1
}

doBuildRabbitMQImage() {
	PROJECT_NAME=$1
	doDownLoadProject $1
	DIR=$SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME
	BUILD_SCRIPT=$SERVICE_DEPLOYMENT_FOLDER/$PROJECT_NAME/build-$PROJECT_NAME-dist.sh
	chmod 777 $BUILD_SCRIPT
	$BUILD_SCRIPT
	doKubeCreate $PROJECT_NAME
}


#!/bin/bash
# The default value for PS3 is set to #?.
# Change it i.e. Set PS3 prompt
COMMAND_TO_EXECUTE=$1
if [ $COMMAND_TO_EXECUTE = "ALL" ]; then
	echo "--------------"
	echo "Starting a clean INSTALL."
	CLEAN_INSTALL=true
	doCleanInstall
	doBuildAllImage
	echo "--------------"
else

	PS3="What you want to deploy ? : "
	export KUBECONFIG="/home/ubuntu/alpha.karmasoc.com/kubeconfig"

	# set deployservice list
	select deployservice in  karmasoc-web karmasoc-user karmasoc-posts ks-business karmasoc-feed karmasoc-web-server karmasoc-mediaserve karmasoc-notifications karmasoc-emailer karmasoc-app build-and-deploy-karmasoc-rabbitmq deploy-karmasoc-rabbitmq deploy-karmasoc-thumbor ks-reporter karmasoc-web-domain ALL DELETE-ALL
	do
	case $deployservice in
		
		karmasoc-web)
			echo "--------------"
			doBuildNPMDist karmasoc-web
			echo "--------------"
			;;
		karmasoc-user)
			echo "--------------"
			doBuildDockerImage karmasoc-user
			echo "--------------"
			;;
		karmasoc-posts)
			echo "--------------"
			doBuildDockerImage karmasoc-posts
			echo "--------------"
			;;
		ks-business)
			echo "--------------"
			doBuildDockerImage ks-business
			echo "--------------"
			;;
		karmasoc-feed)
			echo "--------------"
			doBuildDockerImage karmasoc-feed
			echo "--------------"
			;;
		karmasoc-web-server)
			echo "--------------"
			doBuildDockerImage karmasoc-web-server
			echo "--------------"
			;;
		karmasoc-mediaserve)
			echo "--------------"
			doBuildDockerImage karmasoc-mediaserve
			echo "--------------"
			;;
		karmasoc-notifications)
			echo "--------------"
			doBuildDockerImage karmasoc-notifications
			echo "--------------"
			;;
		karmasoc-emailer)
			echo "--------------"
			doBuildDockerImage karmasoc-emailer
			echo "--------------"
			;;
		karmasoc-app)
			echo "--------------"
			doBuildDockerImage karmasoc-app
			echo "--------------"
			;;
		build-and-deploy-karmasoc-rabbitmq)
			echo "--------------"
			doBuildRabbitMQImage karmasoc-rabbitmq
			echo "--------------"
			;;
		deploy-karmasoc-rabbitmq)
			echo "--------------"
			doKubeCreatePackage karmasoc-rabbitmq
			echo "--------------"
			;;
		deploy-karmasoc-thumbor)
			echo "--------------"
			doKubeCreatePackage karmasoc-thumbor
			echo "--------------"
			;;
		ks-reporter)
			echo "--------------"
			doBuildDockerImage ks-reporter
			echo "--------------"
			;;
		karmasoc-web-domain)
			echo "--------------"
			doBuildDockerImage karmasoc-web-domain
			echo "--------------"
			;;
		ALL)
			echo "--------------"
			echo "Starting a clean INSTALL."
			CLEAN_INSTALL=true
			doCleanInstall
			doBuildAllImage
			echo "--------------"
			;;
		DELETE-ALL)
			echo "--------------"
			echo "Starting TO Delete all kubes."
			doDeleteKUBEDEPLOYMENT
			echo "--------------"
			;;
		*)
			echo "Error: Please try again (select 1..13)!"
			;;
	esac
	done

fi
