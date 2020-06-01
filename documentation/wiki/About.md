
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/80a7f8b2d957d19a4988b07c315b5565f1c343d4/documentation/images/logo_prev.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/8764db84876c347f9f142f34d30a2410960852ee/documentation/images/logo.png)

# Metadata-Hub

This application is developed in the course of the
[AMOS](https://oss.cs.fau.de/teaching/specific/amos/)
project.

## Motivation
Big-Data environments often comprise large amounts of data that have been
integrated from various sources. These can only be turned into valuable
information through the use of metadata, which is significantly more
leightweight, allowing for faster accessing and handling when compared to the
actual data. Therefore, the aim of the Metadata-Hub is to provide a
platform-independent retrieval, storage, and query mechanism for metadata on
large file systems. This will allow end-user applications to obtain resilient
and meaningful data as basis for complex data analyses in order to mine valubale
information for the application-specific context.

## Goals
Our mission is to create a first **prototype** of the Metadata-Hub, an independent
piece of software that intelligently crawls large file systems in order to gain
and store metadata about the files it finds. An intelligent algorithm
continuously traverses the file system and collects interesting metadata.
This metadata is stored in a designated metadata store, thereby generating an
easy-to-access and persistent index of the whole file system.
Finally, existing end-user applications will be able to query and consume the
collected metadata.

## Wiki
This wiki is the official documentation of the Metadata-Hub project.
All included images are preview images that are linked to the larger original
image.
Simply click on the image to view it in higher resolution.
