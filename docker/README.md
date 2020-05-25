# Metadata-Hub @ Docker

### Overview

The Metadata-Hub software is runnable via docker images. There are two main purposes to serve:

- development / testing  (*compose*) → developers

- deployment (*deployment*) → users

### Differences

There are some small differences for these approaches that are listed below.
A more detailed overview about each approach with detailed installation and usage instructions can be found in the corresponding directory.

- **Single vs. multiple container**
  - *compose*: uses docker compose and for each component a single container
    - less dependent, more overhead
  - *deployment*: uses one container that contains all components
    - more dependent, less overhead

- **Environments**
  - *compose*: uses the *testing.json* setting with remote hosts settings
  - *deployment*: uses the *deployment.json* setting with local hosts settings

- **Published**
  - *compose*: not published
  - *deployment*: published via DockerHub at [amosproject2/metadatahub](https://hub.docker.com/r/amosproject2/metadatahub).

### Summary
If you want to simply **use** the application, use *deployment*

If you want to **modify** the software, use *compose*
