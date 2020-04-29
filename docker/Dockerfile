# Creates a docker image with major dependencies installed
FROM alpine:latest

COPY exampleImages /tmp

RUN apk add --update-cache \
	# exiftool \
	python3 \
	openjdk11 \
	postgresql
