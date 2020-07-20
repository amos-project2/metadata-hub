## Database

The database Metadata-Hub is using is a [PostgreSQL](https://www.postgresql.org/) database.
It stores the extracted metadata of the crawled files as well as auxiliary
data for TreeWalk or the query interface.

### Database Setup
1. Create the database role - [metadatahub-role.sql](https://github.com/amos-project2/metadata-hub/blob/master/database/metadatahub-role.sql)
2. Create the database - [metadatahub-database.sql](https://github.com/amos-project2/metadata-hub/blob/master/database/metadatahub-database.sql)
3. Import the schema - [metadatahub-schemata.sql](https://github.com/amos-project2/metadata-hub/blob/master/database/metadatahub-schemata.sql)

Default setup:
 * "database-name": "metadatahub",
 * "database-host": "localhost",
 * "database-port": 5432,
 * "database-user": "metadatahub",
 * "database-password": "metadatahub",

 If another setup wants to be used, the ``.sql`` files in ``metadata-hub/database`` need to be adapted.

##### Loading the Schema:
psql command for Linux
```console
psql metadatahub -U metadatahub -W -f metadatahub-schemata.sql
```

psql command for Windows
```console
metadata=> \i c:/dir/dir/metadatahub-schemata.sql
```

### Database-Schema
The database uses the following tables:
* crawls
* files
* metadata
* intervals
* stored_editor_queries
* schedule
* file_categories

There's a short description about each of these tables in the upcoming sections.

#### crawls

This table stores information about executions of the TreeWalk.
It updates the state, e.g *paused* or *aborted*, and finishing times upon
completion of the exeution.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | bigint | unique identifier of the execution |
| dir_path | text | list of all input directories separated by ',' |
| author | text | author of the configuration |
| name | text | name of the configuration |
| status | text | status of the execution |
| crawl_config | text | configuration of the TreeWalk execution |
| starting_time | timestamp with time zone | start of the execution |
| finished_time | timestamp with time zone | end of the execution |
| update_time | timestamp with time zone | timestamp when the corresponding was updated the last time |


#### intervals

This tables stores information about the time intervals of the TreeWalk that
restrict maximum CPU consumption.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | text | unique identifier of an interval |
| start_time | text | start time of the interval |
| end_time | text | end time of the interval |
| cpu_level | bigint | maximum CPU level during the interval |


#### schedule

This tables stores information about scheduled (periodically) TreeWalk exeuctions.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | text | unique identifier of an entry |
| config | json | configuration of the TreeWalk execution |
| timestamp | timestamp without time zone | timestamp of next execution |
| force | boolean | true if the exeuction should force an already running one to stop |
| pending | boolean | true if the execution is already pending |
| interval | bigint | interval in seconds in which the exeuction repeats |


##### files

The "files" table saves information about all analyzed file metadata, most metadata information lands in the jsonb-File "metadata".

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_files.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_files.PNG)
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
##### files.metadata
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_file_metadata.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_file_metadata.PNG)
