# Metadata-Hub @ Compose

This is the *compose* approach of the Metadata-Hub software.

## Table of contents

  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)

## Installation

In order to run the application, install the following software
- [Docker](https://docs.docker.com/get-docker) with version  *19.03*
- [Docker-Compose](https://docs.docker.com/compose/install/) with version *1.25* or later

You can verify your installation with
```bash
docker -v # Docker version ...
docker-compose -v # docker-compose version ...
```

## Configuration

The components share the following configuration that is build inside the corresponding docker images.
**This** configuration can't be changed without modifying the ```environment.testing.json``` file and rebuilding the images.

```bash
{
    "database-host": "database",
    "database-name": "metadatahub",
    "database-user": "metadatahub",
    "database-password": "metadatahub",
    "database-port": 5432,
    "crawler-host": "0.0.0.0",
    "crawler-port": 9000,
    "server-host": "0.0.0.0",
    "server-port": 8080
}
```

The database is already initialized with the user/password and the database schemata. There is also some test data inside the database.



The ```.env``` file in this directory does configure the following values.
**These** are the values you can safely adapt, because they relate to the host machine the services are running on.

```bash
# Directory to mount into the CRAWLER container
CRAWLER_FILESYSTEM=~/Public

# Directory where the DATABASE is stored on the host
DATABASE_STORAGE=~/.metadatahub-database

# Ports on which the services are available on the host
SERVER_PORT=8080
CRAWLER_PORT=9000
DATABASE_PORT=5432
```


## Usage
You can either use the default ```.env``` file or adapt the configuration.
Once accomplished, you can change into the ```metadata-hub/docker/compose``` directory and start the services.
Please note that starting the system from an arbitrary directory is **not** possible, due to how docker-compose handles ```.env``` files.
```bash
# Assume we are in the root directory of project metadata-hub
cd docker/compose
docker-compose up  # use -d for detached mode
```
The services should now run until you stop them again.
