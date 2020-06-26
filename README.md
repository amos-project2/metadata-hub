# Metadata-Hub

<p align="center">
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/github/license/amos-project2/metadata-hub" />
    </a>
    <a href="https://travis-ci.org/github/amos-project2/metadata-hub/branches">
        <img src="https://img.shields.io/travis/amos-project2/metadata-hub/master.svg?label=master" />
    </a>
    <a href="https://travis-ci.org/github/amos-project2/metadata-hub/branches">
        <img src="https://img.shields.io/travis/amos-project2/metadata-hub/develop.svg?label=develop" />
    </a>
</p>

<p align="center">
<img src="https://raw.githubusercontent.com/amos-project2/metadata-hub/8764db84876c347f9f142f34d30a2410960852ee/documentation/images/logo.png" width="50%" height="50%">
</p>

## About

Our mission is to create a first **prototype** of the Metadata-Hub, an independent
piece of software that intelligently crawls large file systems in order to gain
and store metadata about the files it finds. An intelligent algorithm
continuously traverses the file system and collects interesting metadata.
This metadata is stored in a designated metadata store, thereby generating an
easy-to-access and persistent index of the whole file system.
Finally, existing end-user applications will be able to query and consume the
collected metadata.

## Documentation

The official documentation of this project is provided by the GitHub
[Wiki](https://github.com/amos-project2/metadata-hub/wiki).
There is also a generated version available at the ``documentation/generated``
directory in this repository.
For a more detailed documentation about our official Docker image, please
have a look at our repository at [DockerHub](https://hub.docker.com/r/amosproject2/metadatahub).
