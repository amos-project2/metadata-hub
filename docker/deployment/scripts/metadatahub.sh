#!/bin/bash

# Command line arguments interval and timeout.
# If timeout is 0, the application will run forever.
# The counter is used for determining whether the timeout is exceeded or not.
interval=$1
timeout=$2
counter=$((0))

# Start the database and save the command
process_postresql="postgresql"
service postgresql start >> /dev/null 2>&1
status=$?
if [ $status -ne 0 ]; then
    echo "Failed to start POSTGRESQL: $status"
    exit $status
else
    echo "Successfully started POSTGRESQL."
fi

# Start the crawler and save the command
process_crawler="python3.8 crawler/main.py"
python3.8 crawler/main.py >> /metadatahub/crawler.log 2>&1 &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start CRAWLER: $status"
  exit $status
else
    echo "Successfully started CRAWLER."
fi

# Start the server and save the command
process_server="java -jar server/metadata-hub-server-application-fat.jar"
java -jar server/metadata-hub-server-application-fat.jar \
    >> /metadatahub/server.log 2>&1 &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start SERVER: $status"
  exit $status
else
    echo "Successfully started SERVER."
fi

# Run the application.
# Sleep the defined interval and check, if the timeout was exceeded.
# If one process is not running, exit with an error code.
while sleep $interval; do
    if [ $timeout -ne 0 ]; then
        counter=$(($counter + $interval))
        if [ $counter -ge $timeout ]; then
            break
        fi
    fi
    ps aux |grep "$process_postresql" |grep -q -v grep
    postgresql_status=$?
    if [ $postgresql_status -ne 0 ]; then
        echo "POSTGRESQL stopped. Exiting."
        exit 1
    fi
    ps aux |grep "$process_crawler" |grep -q -v grep
    crawler_status=$?
    if [ $crawler_status -ne 0 ]; then
        echo "CRAWLER stopped. Exiting."
        exit 2
    fi
    ps aux |grep "$process_server" |grep -q -v grep
    server_status=$?
    if [ $server_status -ne 0 ]; then
        echo "SERVER stopped. Exiting."
        exit 3
    fi
    echo "All services running."
done

# If the timeout is exceeded and no error occured, exit with a success message.
echo "Finished."
