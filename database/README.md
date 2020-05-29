## HOWTO SETUP

##### 1.Create Role:            Execute metadatahub-role.sql
##### 2.Create Database:        Execute metadatahub-database.sql
##### 3.Create Schemata:        Execute metadatahub-schemata.sql
##### 4.Add Some Example Data:  Execute metadatahub-data.sql

### Commands for psql-CLI

##### Change the postgres-config first

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

##### On the second step, execute the commands

```console
psql -Upostgres -W -f metadatahub-role.sql
psql -Upostgres -W -f metadatahub-database.sql
psql metadatahubtest -Umetadatahub -W -f metadatahub-schemata.sql
psql metadatahubtest -Umetadatahub -W -f metadatahub-data.sql
```

##### On Windows:
loading ".sql"-Files on Windows using the psql shell
```console
metadata=> \i c:/dir/dir/metadatahub-schemata.sql
```

### Database-Schemata

##### crawls
```
id(bigint)                -> primary key (uses autoincrement sequence)
dir_path(text)            -> starting directory of the crawl
name(text)                -> specified name of the crawler
status(text)              -> status of the crawl (running, finished, suspended, abborted, ...)
crawl_config(text)        -> latest used crawl_config by the crawl, only for user-presentation purposes
analyzed_files(jsonb)     -> array of currently analyzed files at "update_time"
starting_time(date)       -> start time of the crawler job
finished_time(date)       -> the end of the first crawler-job
update_time(date)         -> time of the latest update of the crawl data
analyzed_files_hash(text) -> sha-256 hash of analyzed_files (uses trigger to create hash on inserting and updating)
```
##### files
```
id(bigint)                -> primary key (uses autoincrement sequence)
crawl_id(bigint)          -> foreign key "crawls.id"
dir_path(text)            -> absolute path of the file
name(text)                -> name of the file
type(text)                -> type of the file
size(bigint)              -> the size in bytes
metadata(jsonb)           -> metadata of the file
creation_time(date)       -> time the file was created
access_time(date)         -> time the file was last accessed
modification_time(date)   -> time the file was last modified
file_hash(text)           -> sha-256 hash of the file
```

##### file_generic_data_eav

redundant table to save the metadata in another way than "files.metadata"
is only used by older functions and for testing

```
id(bigint)                -> primary key (uses autoincrement sequence)
tree_walk_id(bigint)      -> reference ID to crawls
file_generic_id(bigint)   -> reference ID to files
attribute(text)           -> name of the attribute
value(text)               -> value of the attribute
unit(text)                -> unit of "value"
```

