DOCKER_COMPOSE=/usr/local/bin/docker-compose
DOCKER_COMPOSE_YAML=/home/ec2-user/deploy/karmasoc/karamsoc-feed/docker-compose-dev.yml

$DOCKER_COMPOSE -f $DOCKER_COMPOSE_YAML stop && $DOCKER_COMPOSE -f $DOCKER_COMPOSE_YAML rm