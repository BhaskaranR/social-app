DOCKER_COMPOSE=/usr/local/bin/docker-compose
DOCKER_COMPOSE_YAML=/home/ec2-user/deploy/karmasoc/karamsoc-web-server/docker-compose-dev.yml
$DOCKER_COMPOSE -f $DOCKER_COMPOSE_YAML pull
$DOCKER_COMPOSE -f $DOCKER_COMPOSE_YAML up --build -d