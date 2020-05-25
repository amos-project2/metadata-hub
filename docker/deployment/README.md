# Metadata-Hub @ Deployment

This is the official Docker image of the Metadata-Hub application.

## Table of contents

  - [Installation](#installation)
  - [Usage](#usage)

## Installation

In order to run the application, install the following software
- [Docker](https://docs.docker.com/get-docker) with version  *19.03* or later

You can verify your installation with
```bash
docker -v # Docker version ...
```

Finally, you can pull the official image from DockerHub. There are two tags available. Specify no tag or ```latest``` for the latest *stable* version that is updated once a week. For the current version that is under development use the tag ```dev```.

```bash
docker pull amosproject2/metadatahub:latest
```

## Usage

The image was built with the following configuration.

```bash
{
    "database-name": "metadatahub",
    "database-host": "0.0.0.0",
    "database-port": 5432,
    "database-user": "metadatahub",
    "database-password": "metadatahub",
    "crawler-host": "0.0.0.0",
    "crawler-port": 9000,
    "server-host": "0.0.0.0",
    "server-port": 8080
}
```

In order to mount the database storage, a volume is required. Mounting
an arbitrary directory will lead to a failure during the PostgreSQL startup.

```bash
 docker volume create --name metadatahub-database -d local
```

You can then run the image according to the configuration using this schema:

```bash
docker run \
    -p {HOST_SERVER_PORT}:8080 \
    -p {HOST_CRAWLER_PORT}:9000 \
    -p {HOST_DATABASE_PORT}:5432 \
    -v {VOLUME}:/var/lib/postgresql/12/main \
    amosproject2/metadatahub
```

This example will publish the *sever* on port *9999*, the *crawler* on
port *9998* and the *database* on port *9997* on the host machine.
Furthermore, the local directory ```/home/johndoe/data``` is mounted into
```/data``` inside the container.

```bash
docker run \
    -p 9999:8080 \
    -p 9998:9000 \
    -p 9997:5432 \
    -v metadatahub-database:/var/lib/postgresql/12/main \
    -v /home/johndoe/data:/filesystem
    amosproject2/metadatahub
```

In order to inspect a running container using *bash*, simply run:

```bash
docker exec -it {CONTAINER_ID} /bin/bash
```
