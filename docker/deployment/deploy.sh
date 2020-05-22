#!/bin/bash

id=$(docker images --filter=reference=metadatahub --format "{{.ID}}")
docker tag $id amosproject2/metadatahub:latest
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push amosproject2/metadatahub
