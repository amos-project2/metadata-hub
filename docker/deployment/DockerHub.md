# Metadata-Hub

This is the official Docker image of the Metadata-Hub application.
It is used to crawl large amount of data and extract meta information about it. This information can be queried using a web interface that
provides a GraphQL interface.

## Documentation

The image basically consists of three main components

-  **Crawler** - Python backend that crawls the data and inserts it into the database
- **Database** - PostgreSQL database that stores the data
- **Server** - Java server that provides the Web/GraphQL interface

All these three services run inside the image.

## Usage

First, pull the image from DockerHub. The ```latest``` version is the latest stable version that is updated once a week. The ```dev``` version is the current status of development.

```bash
docker pull amosproject2/metadatahub:latest
```


In order to mount the database storage, a volume is required. Mounting
an arbitrary directory will lead to a failure during the PostgreSQL startup.

```bash
 docker volume create --name metadatahub-database -d local
```

You can then run the image according to this schema:

```bash
docker run \
    -p {HOST_SERVER_PORT}:8080 \
    -p {HOST_CRAWLER_PORT}:9000 \
    -p {HOST_DATABASE_PORT}:5432 \
    -v {VOLUME}:/var/lib/postgresql/12/main \
    -v {MY-DATA}:/data
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
