#!/bin/bash

branch=$1

# Check if a branch name was passed
if [ -z "$branch" ]; then
    echo "No branch was provided. Aborted"
    exit 1
fi

if [ $branch != "master" ] && [ $branch != "develop" ]; then
    # Do not push any feature branches or hotfixes to DockerHub
    echo "Not pushing branch '$branch' to DockerHub. Done."
else
    # Tag and push 'master' or 'develop' to DockerHub
    image_tag=""
    if [ $branch == "master" ]; then
        image_tag="latest"
    else
        image_tag="dev"
    fi
    id=$(docker images --filter=reference=metadatahub --format "{{.ID}}")
    echo "Tagging image as '$image_tag'. Pushing to DockerHub"
    docker tag $id amosproject2/metadatahub:$image_tag
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker push amosproject2/metadatahub
    docker logout
    echo "Done."
fi
