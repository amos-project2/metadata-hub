# README about database indexes
### Purpose of this document
We want to document the evaluation of the use of indexes.
Indexes are used to improve querying speed of databases, but they increase the used space (disc and RAM) and insertion and update times.
So we want to take a look if it is useful for us to add different indexes to our database.
Is it useful to improve our query speed if we have frequent insert/update operations?
### Types of postgreSQL indexes
Reference [here](https://www.postgresql.org/docs/9.5/indexes-types.html)
<br>
* B-tree index: is the default index used, it can handle equality and range queries and: IS NULL, BETWEEN ...
* Hash index: For the "=="-Operator
* GiST indexes: "Many different indexing strategies can be implemented" using GiST indexes
* GIN indexes: Handle values that contain more than one key -> may be useful for files.metadata which stores our file metadata as a jsonb object

#### Types of Gin indexes for jsonb
Reference jsonb indexing [here](https://www.postgresql.org/docs/9.5/datatype-json.html)
Reference jsonb operations [here](https://www.postgresql.org/docs/9.5/functions-json.html#FUNCTIONS-JSONB-OP-TABLE)
* Default GIN operator class: supports "@> , ?, ?&, ?|" operators
* GIN operator class jsonb_path_ops: supports only the "@>" operator
* GIN indexes on expressions, don't seem relevant for our application

### Which indexes to create?
Plan is to create several indexes:
* One default gin index on files.metadata
* One gin(jsonb_path_ops) index on files.metadata
* One Btree index on a files.metadata attribute e.g. "FileName"
* One Btree index on one other field, e.g. files.name
* One Btree index on timestamps
* Maybe combining multiple indexes dir_path + name

[interesting](http://bitnine.net/blog-postgresql/postgresql-internals-jsonb-type-and-its-indexes/?ckattempt=1)





