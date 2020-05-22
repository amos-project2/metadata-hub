# STAGE: Building the server
# FIXME: Very slow due to no caching process, but I cannot fix it.
FROM maven:3.6.3-jdk-13 AS server-build
RUN mkdir /metadatahub
WORKDIR /metadatahub
COPY server server
COPY web-ui web-ui
RUN mvn -f server/pom.xml package

# STAGE: FINAL IMAGE
FROM ubuntu:latest as app
# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    METADATAHUB_ENV=/metadatahub/configs/environment.deployment.json \
    SERVER_CONFIG=/metadatahub/configs/deployment.env
# Install system dependencies
RUN apt update -y && \
    apt install -y \
        tzdata \
        libpq-dev \
        python3.8 \
        python3-pip \
        openjdk-13-jre \
        postgresql \
        postgresql-contrib
RUN mkdir /metadatahub
WORKDIR /metadatahub
# Setup database
COPY database database
COPY docker/deployment/scripts scripts
USER postgres
RUN /etc/init.d/postgresql start && \
        psql -f database/metadatahub-role.sql && \
        psql -f database/metadatahub-database.sql && \
        psql metadatahub -f database/metadatahub-schemata.sql && \
        psql metadatahub -f database/metadatahub-data.sql && \
    scripts/database.sh
USER root
# Install crawler dependencies
COPY crawler/requirements crawler/requirements
RUN pip3 install -r crawler/requirements/base.txt
COPY crawler crawler
# Copy server artifacts
COPY --from=server-build /metadatahub/server/target/metadata-hub-server-application-fat.jar server/
# Copy configs, export ports and set entrypoint and default arguments via cmd
COPY configs configs
EXPOSE 5432 8080 9000
ENTRYPOINT [ "./scripts/metadatahub.sh" ]
CMD [ "5", "0" ]
