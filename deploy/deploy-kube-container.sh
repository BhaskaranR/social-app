DEPLOY_PATH=/home/ubuntu/deploy-karmasoc-services.k8.sh
USERNAME=ubuntu
PUBLICIP=52.72.221.30
SECRETNAME=/Users/bhaskaran/Documents/karmasoc/deploy/karmasoc-dev-deploy.pem
ssh -i $SECRETNAME $USERNAME@$PUBLICIP $DEPLOY_PATH