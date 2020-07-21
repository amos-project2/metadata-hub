## Database

The database Metadata-Hub is using is a [PostgreSQL](https://www.postgresql.org/) database.
It stores the extracted metadata of the crawled files as well as auxiliary
data for TreeWalk, or the query interface.

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

 If another setup wants to be used, the ``.sql`` files in ``metadata-hub/database`` needs to be adapted.

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
completion of the execution.

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

#### files

This table stores information about files and their metadata.
It is filled and updated by the crawler and is queried by the server.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | bigint | unique identifier of the file |
| crawl_id | bigint | unique identifier of the execution |
| dir_path | text | the directory path to the file without it's name |
| name | text | file name  |
| type | text | file type  |
| size | bigint | file size in bytes  |
| metadata | jsonb | this file's metadata attributes and their values |
| creation_time| timestamp with time zone | creation time of the file |
| access_time | timestamp with time zone | last time the file was accessed |
| modification_time | timestamp with time zone | last time the file was modified |
| file_hash | text | sha256-hash of the file |
| deleted | boolean | flag signaling, if the file was deleted since the last crawl |
| deleted_time | timestamp with time zone | time when the file was found to be deleted |
| in_metadata | boolean | flag signaling, if the file's metadata information was already added to the metadata table |

#### metadata

This table stores all the file types present in the files table, and their associated tags.
It is used in the UI for file type and metadata attribute autocompletion and setting the datatype of a metadata attribute.

| **column**  | **type**  | **description**  |
|---|---|---|
| file_type | text | file type present in the files table |
| tag | json | the file type's associated tags, their number of occurrence and the datatype of the tag (String or Digit)  |

#### intervals

This tables stores information about the time intervals of the TreeWalk that
restrict maximum CPU consumption.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | text | unique identifier of an interval |
| start_time | text | start time of the interval |
| end_time | text | end time of the interval |
| cpu_level | bigint | maximum CPU level during the interval |

#### stored_editor_queries

This table stores information about queries created by the Query Editor in the WebUI.
In the WebUI they can be saved and restored again.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | bigint | unique identifier of a query |
| author | text | author of the query |
| title | text | name of the query |
| create_time | timestamp with time zone | creation time of the query |
| data | jsonb | data which is used to restore the query in the Query Editor |

#### schedule

This tables stores information about scheduled (periodically) TreeWalk executions.

| **column**  | **type**  | **description**  |
|---|---|---|
| id | text | unique identifier of an entry |
| config | json | configuration of the TreeWalk execution |
| timestamp | timestamp without time zone | timestamp of next execution |
| force | boolean | true if the execution should force an already running one to stop |
| pending | boolean | true if the execution is already pending |
| interval | bigint | interval in seconds in which the execution repeats |

#### file_categories

This table stores File Type Categories, which can be created in the WebUI and are used for grouping together multiple file types.
They can be used in the Query Editor to select multiple file types at once.

| **column**  | **type**  | **description**  |
|---|---|---|
| file_category | text | unique identifier and name of a File Type Category |
| file_types | jsonb | list of all the file types associated with the File Type Category |
