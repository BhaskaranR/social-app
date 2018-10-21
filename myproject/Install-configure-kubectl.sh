#!/bin/bash
SUBDOMAIN=alpha.karmasoc.com
KUBECONFIG_HOME=${HOME}/$SUBDOMAIN/kubeconfig

installKubectl() {
	curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/darwin/amd64/kubectl	
	curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/darwin/amd64/kubectl
	chmod +x ./kubectl
	sudo mv ./kubectl /usr/local/bin/kubectl
}

configureKubectl() {
	cp -r ./$SUBDOMAIN/* ${HOME}
	export KUBECONFIG="$KUBECONFIG_HOME"

}

installAWSClient() {
	curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
	unzip awscli-bundle.zip
	sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws
}


drawMenu() {
	# clear the screen
	tput clear

	# Move cursor to screen location X,Y (top left is 0,0)
	tput cup 3 15

	# Set a foreground colour using ANSI escape
	tput setaf 3
	echo "Karmasoc INC."
	tput sgr0

	tput cup 5 17
	# Set reverse video mode
	tput rev
	echo "M A I N - M E N U"
	tput sgr0

	tput cup 7 15
	echo "1. Install and Configure Kubectl"

	tput cup 8 15
	echo "2. Configure Kubectl"

	tput cup 9 15
	echo "3. Install AWS Command line"

	# Set bold mode
	tput bold
	tput cup 11 15
	# The default value for PS3 is set to #?.
	# Change it i.e. Set PS3 prompt
	read -p "Enter your choice [1-3] " choice
}

drawMenu
tput sgr0
# set deployservice list
case $choice in
	1)
		echo "#########################"
		echo "Starting a Kubectl INSTALL."
		installKubectl
		echo "Configure kubectl client."
		configureKubectl
		echo "#########################"
		;;
	2)
		echo "#########################"
		echo "Configure kubectl client."
		configureKubectl
		echo "#########################"
		;;
	3)
		echo "#########################"
		echo "Starting a AWS COMMAND LINE INSTALL."
		installAWSClient
		echo "#########################"
		;;
	*)
		echo "Error: Please try again (select 1..3)!"
		;;
esac


