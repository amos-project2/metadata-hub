This chapter will show you how to install the software requirements
and the Metadata-Hub application.
It is important to mention that this is **no** application that should be used
in a production environment because of predefined user/password settings that
cannot be changed.

## Requirements

The application is published as a Docker image.
Thus, it requires your system to have the Docker Engine installed.
Therefore, please refer to the official installation instructions of Docker at
[https://docs.docker.com/get-docker](https://docs.docker.com/get-docker).
Please make sure to install at least version *19.03* and check the installation
before continuing.

## Usage

This guide is written based on a working Docker setup on Linux.
If you want to use the Software on Windows, please follow the procedure but
modify the commands according to your setup.
When you're using PowerShell on Windows, you can use the same commands as
described below.

#### Pulling the image

In the first step, pull the image from DockerHub.
The ```latest``` version is the latest stable version that is updated on each release.
The ```dev``` version is the currently developed version and may still contain
errors.
Execute the following command in order to pull the latest stable image.

```bash
$ docker pull amosproject2/metadatahub:latest
```

#### Persisting the database

If you want to persist the database on your machine, a Docker volume is required.
Mounting an arbitrary directory will lead to a failure during the PostgreSQL
startup. Here is an example that shows how to create a local volume using
the Docker CLI. For more information, please have a look at the
[official documentation](https://docs.docker.com/storage/volumes/).

```bash
 docker volume create --name metadatahub-database -d local
```

#### Running Metadata-Hub

The image can be started according to the following command:

```bash
docker run \
    -p {ui-port}:8080 \
    -p {treewalk-port}:9000 \
    -p {database-port}:5432 \
    -v {data}:/filesystem \
    -v {volume-name}:/var/lib/postgresql/12/main \
    amosproject2/metadatahub
```

* ``ui-port``<br>
  The port that publishes the web interface on the *host* machine.

* ``treewalk-port``<br>
  The port that publishes the TreeWalk API on the *host* machine.
  Setting this port is only required when you directly want to access the
  TreeWalk API and can be omitted.

* ``database-port``<br>
  The port that publishes the database instance on the *host* machine.
  Setting this port is only required when you directly want to access the
  database and can be omitted.

* ``data``<br>
  This directory will be mounted inside the container and therefore is
  accessible for the TreeWalk.

* ``volume-name``<br>
  The name of the volume that should be used to persist the database on the
  host machine over multiple runs. In the example from above, the volume name
  would be set to ``metadatahub-database``

The internal ports ``8080``, ``9000`` and ``5432`` must **not** change because
they are required for internal communication.
Of course, multiple directories can be mounted inside the container,
simply provide each directory with the corresponding ``-v`` flag.

This example starts a container with access to the ``/home/data`` directory.

```bash
docker run \
    -p 8080:8080 \
    -v /home/data:/filesystem  \
    -v metadatahub-database:/var/lib/postgresql/12/main \
    amosproject2/metadatahub
```

Please refer to the
[Usage Guide](https://github.com/amos-project2/metadata-hub/wiki/Usage)
for a demo of how to use the application. Make sure to provide the filepaths
relative to mounted directory inside the container.

#### Inspecting a container

In order to inspect a container with the ID ``container-id``,
start a bash session inside the container.

```bash
docker exec -it {container-id} /bin/bash
```

The log files for further investigation are directly located in the
``/metadatahub`` root directory.

If you encounter any errors, please refer to the
[FAQ](https://github.com/amos-project2/metadata-hub/wiki/FAQ) section.
