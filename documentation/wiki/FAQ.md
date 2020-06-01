### I have problems with docker permissions using Linux.

It is most likely your user does not belong to the ``docker`` group.
Please have a look at these
[instructions](https://docs.docker.com/engine/install/linux-postinstall/).

### I have problems with a running container and want to inspect them.

You can start a shell session in your running container:

```bash
docker exec -it {container-id} /bin/bash
```

This will start a *bash* session inside the container with the ID
``container-id``. Furthermore, you can inspect the log files at
``/metadatahub/server.log`` and ``/metadatahub/crawler.log``.
