#!/bin/bash

# Initialize the postgres database to be accessible from outside
POSTGRESQL_CONF=$(find /etc/postgresql -name "postgresql.conf")
echo "listen_addresses = '*'" >> $POSTGRESQL_CONF
POSTGRESQL_HBA_CONF=$(find /etc/postgresql -name "pg_hba.conf")
echo "host    all    all    0.0.0.0/0    md5" >> $POSTGRESQL_HBA_CONF
echo "host    all    all    ::/0         md5" >> $POSTGRESQL_HBA_CONF
