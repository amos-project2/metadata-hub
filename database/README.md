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

### Database-Schemata

###### tree_walk
```
id -> primary key (autoincrement)
name -> a name/title, which the user can choose
notes -> notes, which the user can add to this tree_walk
root_path -> ? maybe the absolut path to the path
created_time -> when this entry here is created/when the crawler job started
finished_time -> the end of the first crawler-job
status -> the status (crawling, finished, abborted, ...)
crawl_config -> the config-data the crawler was/is executed, only for user-presentation purposes
crawl_update_time -> the last finish of the last update
save_in_generic_table -> boolean, if true -> save in the big-table file_generic, if false, the crawl-data comes to a new table, for example file_%ID
```
###### file_generic
```
id -> primary key (autoincrement)
tree_walk_id -> reference ID to tree_walk
sub_dir_path -> the subdir path
name -> the name of the file
file_typ -> the file_type as a String
size -> the size in bytes
file_create_data -> the file create data
file_modyfy_data -> the file modify data
file_access_date -> the file access date
metadata -> json_field, which could contains as json all metadata
```

###### file_generic

its redundand to the metadata field, but for now we are not sure, what we want to use
maybe the json_field metada could be faster, cause there postgres can optimize on itself

```
id -> primary key (autoincrement) -> cause postgres want a primary-key, but we can choose a other primary key
tree_walk_id -> reference ID to tree_walk
file_generic_id -> reference ID to file_generic
attribute -> as String the attribute name
value -> as String the attribute value
unit -> as String the unit (but i have no idea what the content here could be, cause the exiftool dont deliver units)
```

