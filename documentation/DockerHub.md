# Metadata-Hub

<p align="center">
    <img alt="Ooops, there should have been the logo :(" src=https://raw.githubusercontent.com/amos-project2/metadata-hub/8764db84876c347f9f142f34d30a2410960852ee/documentation/images/logo.png width="33%" height="33%"/>
</p>

This is the official Docker image of the Metadata-Hub application.
It is used to crawl large amount of data and extract meta information about it.
This information can be queried using a web interface that provides a GraphQL interface.

## Overview

The image consists of three major components

- **Crawler**<br>
   Python backend that crawls the data and inserts it into the database.
   Uses multiple worker processes to speed up the tree traversal.
   Provides a REST API for configuring/controlling the crawler.
- **Database**<br>
  PostgreSQL database that stores the metadata.
  It also stores information about executions of the tree walk.
- **Server**<br>
  Java server that provides the Web/GraphQL interface.
  This component enables the user to query the metadata using the GraphQL
  query language.

All these three services run inside the image as standalone processess.

## Usage

First, pull the image from DockerHub.
The ```latest``` version is the latest stable version that is updated once a week.
The ```dev``` version is the current status of development.

```bash
docker pull amosproject2/metadatahub:latest
```

In order to mount the database storage, a volume is required.
Mounting an arbitrary directory will lead to a failure during the PostgreSQL startup.

```bash
 docker volume create --name metadatahub-database -d local
```

You can then run the image according to this schema:

```bash
docker run \
    -p {HOST_SERVER_PORT}:8080 \
    -p {HOST_CRAWLER_PORT}:9000 \
    -v {DATA}:/filesystem \
    -v metadatahub-database:/var/lib/postgresql/12/main \
    amosproject2/metadatahub
```

The following values have to be specified by the user:

* ``HOST_SERVER_PORT``<br>
  The port that publishes the *server* with the graphical user interface for data querying on the *host* machine.

* ``HOST_CRAWLER_PORT``<br>
  The port that publishes the API of the *crawler* on the *host* machine.

* ``DATA``<br>
  This directory will be mounted inside the container and therefore is
  accessible for the crawler.

The ports *8080* and *9000* must not change thus they are required for internal
communication.
Of course, multiple directories can be mounted inside the container,
simply provide each directory with the corresponding ``-v`` flag.

This example starts a container with access to the ``/home/data`` directory.

```bash
docker run \
    -p 9999:8080 \
    -p 9998:9000 \
    -v metadatahub-database:/var/lib/postgresql/12/main \
    -v /home/data:/filesystem  \
    amosproject2/metadatahub
```

If you want to connect to the PostgreSQL database directly, provide an
additional ``-p 9997:5432``. This will publish the running PostgreSQL instance
on your host machine. Please refer to the
[Usage Guide](https://github.com/amos-project2/metadata-hub/wiki/Usage)
for a demo of how to use the application.

In order to inspect a running container, start a shell session using *bash* inside the container:

```bash
docker exec -it {CONTAINER_ID} /bin/bash
```

If you encounter any errors, please refer to the
[FAQ](https://github.com/amos-project2/metadata-hub/wiki/FAQ) section.
