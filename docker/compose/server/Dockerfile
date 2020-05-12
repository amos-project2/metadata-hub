FROM maven:3.6.3-jdk-13 AS build
WORKDIR /usr/app
COPY server/src/ src
COPY server/pom.xml .
COPY server/metadatahub.sql .
RUN mvn -f pom.xml clean package

FROM openjdk:13 AS run
WORKDIR /usr/app
# Enable IPv4 because IPv6 resolution in Docker will not work with the http server
ENV JAVA_OPTS="-Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true"
COPY --from=build /usr/app/target/metadata-hub-server-application-fat.jar .
COPY docker/compose/.env ./config
ENTRYPOINT exec java $JAVA_OPTS -jar /usr/app/metadata-hub-server-application-fat.jar /usr/app/config
