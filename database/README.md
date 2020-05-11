## HOWTO SETUP

##### 1. Execute metadatahub-role.sql
##### 2. Execute metadatahub-database.sql
##### 3. Execute metadatahub-schemata.sql
##### 4. (Optional) Execute metadatahub-data.sql

### Commands for psql-CLI

###### Change the postgres-config first

/etc/postgresql/12/main/pg_hba.conf<br><br>
If you cant find the config file there you could search for it with the following command:
$ locate pg_hba.conf<br><br>
(change the peer values to md5)<br>
```
# DO NOT DISABLE!
# If you change this first entry you will need to make sure that the
# database superuser can access the database using some other method.
# Noninteractive access to all databases is required during automatic
# maintenance (custom daily cronjobs, replication, and similar tasks).
#
# Database administrative login by Unix domain socket -was peer
local   all             postgres                                md5
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# "local" is for Unix domain socket connections only -was peer
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
# Allow replication connections from localhost, by a user with the
# replication privilege. -was peer
local   replication     all                                     md5
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
```

###### on the scond step, execute the commands

```console
psql -Upostgres -W -f metadatahub-role.sql
psql -Upostgres -W -f metadatahub-database.sql
psql metadatahubtest -Umetadatahub -W -f metadatahub-schemata.sql
psql metadatahubtest -Umetadatahub -W -f metadatahub-data.sql
```

