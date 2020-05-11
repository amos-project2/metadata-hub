# Deployment system

This is the deployment system of the Metadata-Hub project.
At the moment, it is basically used for testing and debugging purposes.
Further functionality and improvements will be included in the future.
It is based on the Docker Engine to provide as much platform independency as possible.

## Table of contents

- [Deployment system](#deployment-system)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)

## Installation

In order to run the system prototype, [Docker](https://docs.docker.com/get-docker) and [Docker-Compose](https://docs.docker.com/compose/install/) must be installed on the system. You can check your installation with.
The system should run with Docker >= 19.03 and Docker-Compose >= 1.25.

## Configuration

<span style="color:red; font-weight:bold">WARNING</span> Do **not** use the following configuration for production/deployment purposes

The system is configured by a simple environment file. It's required for sharing the correct credentials and connection parameter between the different services.

Here is the full working example of the config file. It is also used for the server component, these values have an other naming convention (see [here](https://github.com/amos-project2/metadata-hub/tree/master/server) for a more detailed explanation).

```bash
# Settings for docker services
CRAWLER_FILESYSTEM=~/Public                     # Filesystem on the host to analyze (can change)
DATABASE_USER=metadatahub
DATABASE_PASSWORD=metadatahub
DATABASE_STORAGE=~/.metadatahub-database        # The location where the database is stored on the host (can change)
SERVER_PORT=8080                                # Port for the host system (can change)
CRAWLER_PORT=9001                               # Port for the host system (can change)
DATABASE_PORT=9002                              # Port for the host system (can change


# Settings for the server component
dataSource.user=metadatahub
dataSource.password=metadatahub
dataSource.databaseName=metadatahub
dataSource.portNumber=5432                      # Do not change
dataSource.serverName=database                  # Name of the corresponding docker-compose service
httpserver.address=0.0.0.0                      # Do not change
httpserver.port=8080                            # Do not change

```

The uncommented values are obviously the database configuration and can be changed, but must always match with upper/lowercase ones.

The database is initialized with the schema and data located in
```database/metadatahub-database.sql``` and ```database/metadatahub-data.sql```
(in this order)

## Usage
Once configured, simply change into the compose directory and start the services.
Please note that starting the system from an arbitrary directory is currently **not** supported, because some paths relative to the current working directory.
```bash
cd crawler/compose
docker-compose up  # use -d for detached mode
```
If you're using not the default ```.env``` file, you must specify the config file via
```bash
docker-compose up --env-file <PATH>
```
