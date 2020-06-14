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
* GiST indexes: "Many different indexing strategies can be implemented" using GiST indexes -> used for text searches not comparisons
* GIN indexes: Handle values that contain more than one key -> may be useful for files.metadata which stores our file metadata as a jsonb object

#### Types of indexes for jsonb
Reference jsonb indexing [here](https://www.postgresql.org/docs/9.5/datatype-json.html)
Reference jsonb operations [here](https://www.postgresql.org/docs/9.5/functions-json.html#FUNCTIONS-JSONB-OP-TABLE)
* Default GIN operator class: supports "@> , ?, ?&, ?|" operators
* GIN operator class jsonb_path_ops: supports only the "@>" operator
* It is also possible to use the btree and hash index on a jsonb operator as "->>"(e.g. metadata ->> 'FileName')


### Which indexes to create?
Plan is to create several indexes:

* One default gin index on files.metadata:
SQL: CREATE INDEX gin_index_metadata ON public.files USING gin (metadata);

* One gin(jsonb_path_ops) index on files.metadata:
SQL: CREATE INDEX gin_index_metadata_jsonb_path_ops ON public.files USING gin (metadata jsonb_path_ops);

* One Btree index on a files.metadata attribute e.g. "FileName":
SQL: CREATE INDEX btree_index_metadata_FileName ON public.files USING BTREE((metadata ->> 'FileName'));

* One Btree index on one other field, e.g. files.name:
SQL: CREATE INDEX btree_index_name ON public.files USING BTREE(name);

* Combining multiple indexes dir_path + name:
SQL: CREATE INDEX btree_index_full_path ON public.files USING BTREE(dir_path, name);



<br>

[interesting](http://bitnine.net/blog-postgresql/postgresql-internals-jsonb-type-and-its-indexes/?ckattempt=1)





