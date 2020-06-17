# README about database indexes
### Purpose of this document
We want to document the evaluation of the use of indexes.
Indexes are used to improve querying speed of databases, but they increase the used space (disc and RAM) and insertion and update times.
So we want to take a look if it is useful for us to add different indexes to our database.
Is it useful to improve our query speed if we have frequent insert/update operations?
Generally indexes would be evaluated by checking if most of the queries used on the database use the indexes and if the speed-up is then worth it.
Especially fields with [high cardinality](https://en.wikipedia.org/wiki/Cardinality_(SQL_statements)) can benefit from indexes.
So an index on the file name is more useful than on the file type.
As analyzing and optimizing queries is a difficult topic, we will for now just check what kind of speed up we will get from queries that use different indexes and how much indexes slow down data insertions and updates.


### Types of postgreSQL indexes
[Reference here](https://www.postgresql.org/docs/9.5/indexes-types.html)
<br>
* B-tree index: is the default index used, it can handle equality and range queries and: IS NULL, BETWEEN ...
* Hash index: For the "=="-Operator
* GiST indexes: "Many different indexing strategies can be implemented" using GiST indexes -> used for text searches not comparisons
* GIN indexes: Handle values that contain more than one key -> may be useful for files.metadata which stores our file metadata as a jsonb object

#### Types of indexes for jsonb
[Reference jsonb indexing here](https://www.postgresql.org/docs/9.5/datatype-json.html)
<br>
[Reference jsonb operations here](https://www.postgresql.org/docs/9.5/functions-json.html#FUNCTIONS-JSONB-OP-TABLE)
* Default GIN operator class: supports "@> , ?, ?&, ?|" operators
* GIN operator class jsonb_path_ops: supports only the "@>" operator
* It is also possible to use the btree and hash index on a jsonb operator as "->>"(e.g. metadata ->> 'FileName')


### Which indexes to create?
Plan is to create several indexes:

1. One default gin index on files.metadata:
``CREATE INDEX gin_index_metadata ON public.files USING gin (metadata);``

1. One gin(jsonb_path_ops) index on files.metadata:
``CREATE INDEX gin_index_metadata_jsonb_path_ops ON public.files USING gin (metadata jsonb_path_ops);``

1. One Btree index on a files.metadata attribute e.g. "FileName":
``CREATE INDEX btree_index_metadata_FileName ON public.files USING BTREE((metadata ->> 'FileName')text_pattern_ops);``

1. One Btree index on files.name:
``CREATE INDEX btree_index_name ON public.files((name)text_pattern_ops);``

1. One Btree index on files.size:
``CREATE INDEX btree_index_size ON public.files(size);``

1. Combining multiple indexes dir_path + name:
``SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/dir10/D%';``

<br>
<br>
Notice:
**text_pattern_ops** enables SQL "LIKE"-comparisons when the database does not use the standard "C" locale.
But disables comparisons like <, <=, > and >=.

[Reference index operator classes here](https://www.postgresql.org/docs/9.5/indexes-opclass.html)

### How to test the different indexes?
Use unique queries that benefit from the indexes and compare the query times with the database without indexes.
Queries need to affect less rows so that index scans are preferred over seq. scans.
1. Queries for the gin index on files.metadata:
``
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}';
SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate';
SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution'];
``
1. Queries for the gin index with the jsonb_path_ops operator:
``
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}';
``
1. Queries for the btree index on metadata->>FileName
``
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-53%';
``
1. Queries for the btree index on files.name
``
SELECT * FROM files WHERE name LIKE 'CNV-53%';
``

1. Queries for the btree index on files.size:
``
SELECT * FROM files WHERE size >= 300000;
``

1. Query for the btree index that combines dir_path + name into a full path:
``SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/%';``

Notice: Index scans and bitmap scans can be turned off, for easier comparisons
``SET enable_indexscan TO false;
    SET enable_bitmapscan TO false;``

#### Index Sizes
Index Sizes for the tree structured file dump (1104 files ~1240 kB)

1. Gin: 584kB
1. Gin jsonb_path_ops: 304kB
1. Btree metadata->>'FileName': 64kB
1. Btree files.name: 64kB
1. Btree files.size: 48kB
1. Btree on fullpath: 120kB

#### Index query times
Testing index queries on this size of a test set (1104 files) is unnecessary.
On most queries there was no significant difference between index or sequential scans.
Most were around 0.02 ms faster others were slower.
```console

**************
Start index test!
------ Gin Default
---------------------
SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate';
-------------------------------------------------------------
Average Time Normal :  15307917 nano_sec | 15 m_sec
Average Time Index :  15391877 nano_sec | 15 m_sec
Index Speed Up:  -83960 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution'];
-------------------------------------------------------------
Average Time Normal :  1230333 nano_sec | 1 m_sec
Average Time Index :  273223 nano_sec | 0 m_sec
Index Speed Up:  957110 nano_sec | 0 m_sec
-------------------------------------------------------------
------ Gin Jsonb Path Ops
-------------------------
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}';
-------------------------------------------------------------
Average Time Normal :  11855922 nano_sec | 11 m_sec
Average Time Index :  11701590 nano_sec | 11 m_sec
Index Speed Up:  154332 nano_sec | 0 m_sec
-------------------------------------------------------------
------ Btree metadata ->>'FileName'
------------------------------------
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-53%';
-------------------------------------------------------------
Average Time Normal :  1176617 nano_sec | 1 m_sec
Average Time Index :  277113 nano_sec | 0 m_sec
Index Speed Up:  899504 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-5311%';
-------------------------------------------------------------
Average Time Normal :  1067380 nano_sec | 1 m_sec
Average Time Index :  196358 nano_sec | 0 m_sec
Index Speed Up:  871022 nano_sec | 0 m_sec
-------------------------------------------------------------
----- Btree files.name
-----------------------
SELECT * FROM files WHERE name LIKE 'CNV-53%';
-------------------------------------------------------------
Average Time Normal :  458652 nano_sec | 0 m_sec
Average Time Index :  286416 nano_sec | 0 m_sec
Index Speed Up:  172236 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE name LIKE 'CNV-5311%';
-------------------------------------------------------------
Average Time Normal :  436904 nano_sec | 0 m_sec
Average Time Index :  235143 nano_sec | 0 m_sec
Index Speed Up:  201761 nano_sec | 0 m_sec
-------------------------------------------------------------
----- Btree files.size
-----------------------
SELECT * FROM files WHERE size <= 300000;
-------------------------------------------------------------
Average Time Normal :  11542924 nano_sec | 11 m_sec
Average Time Index :  11547159 nano_sec | 11 m_sec
Index Speed Up:  -4235 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 300000;
-------------------------------------------------------------
Average Time Normal :  1401272 nano_sec | 1 m_sec
Average Time Index :  1254935 nano_sec | 1 m_sec
Index Speed Up:  146337 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 500000;
-------------------------------------------------------------
Average Time Normal :  1263388 nano_sec | 1 m_sec
Average Time Index :  1096945 nano_sec | 1 m_sec
Index Speed Up:  166443 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 800000;
-------------------------------------------------------------
Average Time Normal :  1122788 nano_sec | 1 m_sec
Average Time Index :  1013846 nano_sec | 1 m_sec
Index Speed Up:  108942 nano_sec | 0 m_sec
-------------------------------------------------------------
----- Btree fullpath
-----------------------
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/%';
-------------------------------------------------------------
Average Time Normal :  2009146 nano_sec | 2 m_sec
Average Time Index :  2137611 nano_sec | 2 m_sec
Index Speed Up:  -128465 nano_sec | 0 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/dir10/%';
-------------------------------------------------------------
Average Time Normal :  1269261 nano_sec | 1 m_sec
Average Time Index :  1415780 nano_sec | 1 m_sec
Index Speed Up:  -146519 nano_sec | 0 m_sec
-------------------------------------------------------------
End index test!
**************
```

### Index Insertion Times

The insertion times of the crawler with and without the indexes can be found [here](https://drive.google.com/drive/folders/1_ZKsWZbUbNF59RixjDvktCSrTypWAz7w)

But these also need to be tested again with a bigger test set.

<br>
<br>

[interesting](http://bitnine.net/blog-postgresql/postgresql-internals-jsonb-type-and-its-indexes/?ckattempt=1)





