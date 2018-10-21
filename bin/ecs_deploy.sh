#! /bin/bash

# Deploy only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Deploy only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "Deploying $TRAVIS_BRANCH on $TASK_DEFINITION"
    ./setup/bin/ecs_push -c $CLUSTER -n $SERVICE -r us-east-1 -v -i $REMOTE_IMAGE_URL:latest
  else
    echo "Skipping deploy because it's not an allowed branch"
  fi
else
  echo "Skipping deploy because it's a PR"
fi
