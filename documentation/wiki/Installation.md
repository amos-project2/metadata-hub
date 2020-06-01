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

## Installation

The image is published using the DockerHub registry at
[amosproject2/metadatahub](https://hub.docker.com/r/amosproject2/metadatahub).
There are two versions of the application you can use:

* ``latest`` The latest stable version, usually updated once a week
* ``dev`` The currently developed version, might be unstable

The ``latest`` version is the recommended one to use, thus

```bash
$ docker pull amosproject2/metadatahub
```

will pull the image tagged with ``latest`` by default.

### Configuration

The image is build with a default configuration that specifies some mandatory
settings that cannot be changed, such as the default database user and
port settings inside the container (see more at [Usage](#Usage)).

The storage of the database will kept inside the container by default.
Indeed, it can be useful to store this data on the host system to access it
later on.
Therefore, simply create a Docker volume that is used to store the content
of the database.

```bash
$ docker volume create --name metadatahub-database -d local
```

It is also possible to use multiple volumes to have separate 'databases' for the
various container.

### Usage

After setting everything up, you are ready to run the image.
Therefore, use the following template.

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
  The port that publishes the *server* with the graphical user interface for
  data querying on the *host* machine.

* ``HOST_CRAWLER_PORT``<br>
  The port that publishes the *crawler* for starting/stopping/etc. the
  crawling mechanism on the *host* machine.

* ``DATA``<br>
  The directory/filesystem you want to crawl.

The ports *8080* and *9000* must not change thus they are required for internal
communication.
For example, you can run the image with the following command.

```bash
docker run \
    -p 9999:8080 \
    -p 9998:9000 \
    -v /home/john/data:/filesystem
    -v metadatahub-database:/var/lib/postgresql/12/main \
    amosproject2/metadatahub
```

You should be able to access both *localhost:9999* and *localhost:9998* for
the corresponding services.

If you encounter any errors, please refer to the
[FAQ](https://github.com/amos-project2/metadata-hub/wiki/FAQ) section.

