#!/usr/bin/env bash

function check {
	RUNNING=$1
	EXIT=$2
	NAME=$3
	if [ "${RUNNING}" == "false" ] && [ "${EXIT}" -ne 0 ]; then
		echo "${NAME} didn't exit correctly."
		exit 1
	fi
}

TIMEOUT=60

docker-compose build --parallel --force-rm --no-cache
docker-compose up &
PID=$!
sleep $TIMEOUT

# CHECK SERVER
RUNNING_SERVER=$(docker inspect -f {{.State.Running}} metadata-hub.server)
EXIT_SERVER=$(docker inspect -f {{.State.ExitCode}} metadata-hub.server)
check "${RUNNING_SERVER}" "${EXIT_SERVER}" "metadata-hub.server"

# CHECK DATABASE
RUNNING_DATABASE=$(docker inspect -f {{.State.Running}} metadata-hub.database)
EXIT_DATABASE=$(docker inspect -f {{.State.ExitCode}} metadata-hub.database)
check "${RUNNING_DATABASE}" "${EXIT_DATABASE}" "metadata-hub.database"

# CHECK CRAWLER
RUNNING_CRAWLER=$(docker inspect -f {{.State.Running}} metadata-hub.crawler)
EXIT_CRAWLER=$(docker inspect -f {{.State.ExitCode}} metadata-hub.crawler)
check "${RUNNING_CRAWLER}" "${EXIT_CRAWLER}" "metadata-hub.crawler"

echo "OK."
