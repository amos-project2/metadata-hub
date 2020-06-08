## Database
All file metadata analyzed by the crawler gets inserted in a [PostgreSQL](https://www.postgresql.org/) database.
As well as information about the crawls, which get started by the crawler Component, are stored in the database.

### Database Setup
1. Create the Database Role or Import the Database (/metadatahub/metadatahub-role.sql)
2. Create the Database or Import the Database (/metadatahub/metadatahub-database.sql)
3. Import the Schemata

Default setup:
 * "database-name": "metadatahub",
 * "database-host": "localhost",
 * "database-port": 5432,
 * "database-user": "metadatahub",
 *  "database-password": "metadatahub",

 If another setup wants to be used metadata-hub/configs need to be adapted.

##### Loading the Schemata:
psql command for Linux
```console
psql metadatahub -Umetadatahub -W -f metadatahub-schemata.sql
```

psql command for Windows
```console
metadata=> \i c:/dir/dir/metadatahub-schemata.sql
```

### Database-Schemata
The database uses two tables.
* The "crawls" table saves information about started crawls/tree_walks.
* The "files" table saves information about all analyzed file metadata, most metadata information lands in the jsonb-File "metadata".
##### crawls
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_crawls.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/database/database_crawls.PNG)
```
id(bigint)                -> primary key (uses autoincrement sequence)
dir_path(text)            -> starting directory of the crawl
name(text)                -> specified name of the crawler
status(text)              -> status of the crawl (running, finished, suspended, abborted, ...)
crawl_config(text)        -> latest used crawl_config by the crawl
analyzed_dirs(jsonb)      -> array of currently analyzed dirs at "update_time"
starting_time(date)       -> start time of the crawler job
finished_time(date)       -> the end of the first crawler-job
update_time(date)         -> time of the latest update of the crawl data
analyzed_dirs_hash(text)  -> sha-256 hash of analyzed_dirs (uses trigger to create hash on inserting and updating)
```
##### files
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
