FROM maven:3.6.3-jdk-13 AS build
RUN mkdir /metadatahub
WORKDIR /metadatahub
COPY server server
COPY web-ui web-ui
COPY configs configs
RUN cd server && mvn -f pom.xml package

FROM openjdk:13 AS run
RUN mkdir /metadatahub
WORKDIR /metadatahub
ENV METADATAHUB_ENV=/metadatahub/configs/environment.testing.json
COPY configs configs
# Enable IPv4 because IPv6 resolution in Docker will not work with the http server
ENV JAVA_OPTS="-Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true"
COPY --from=build /metadatahub/server/target/metadata-hub-server-application-fat.jar .
CMD ["sh", "-c", "java $JAVA_OPTS -jar metadata-hub-server-application-fat.jar"]
