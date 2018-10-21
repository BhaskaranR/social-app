#!/bin/sh

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ $current_branch != 'master' ];
then
    echo "Im doing nothing, you are not on master branch"
    exit 1
fi

if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]];
then
    echo "Im doing nothing, you got something dirty"
    exit 1
fi


rm -rf docs/*
npm run documentation


git checkout gh-pages

rsync -a docs/* ./

git add .
git commit -m 'generate documentation'
git push origin gh-pages
git checkout master