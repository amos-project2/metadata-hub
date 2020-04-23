# Creates a docker image with exiftool installed
FROM alpine:latest

COPY exampleImages /tmp

RUN apk update && \
	apk add exiftool
