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
``CREATE INDEX btree_index_full_path ON public.files((dir_path ||'/' || name)text_pattern_ops);``

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
SELECT * FROM files WHERE metadata ? 'Format';
SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate';
SELECT * FROM files WHERE metadata ?& array['Format', 'Balance', 'HistoryWhen', 'MajorBrand'];
SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution'];
``
1. Queries for the gin index with the jsonb_path_ops operator:
``
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}';
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg", "BitsPerSample": 8, "FilePermissions": 770, "YCbCrSubSampling": "2 2"}';
``
1. Queries for the btree index on metadata->>FileName
``
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-01-01-01-11.mp4%';
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-%';
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-53%';
``
1. Queries for the btree index on files.name
``
SELECT * FROM files WHERE name LIKE '01-02-01-01-01-01-11.mp4%';
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-%';
SELECT * FROM files WHERE name LIKE 'CNV-53%';
``

1. Queries for the btree index on files.size:
``
SELECT * FROM files WHERE size >= 300000;
SELECT * FROM files WHERE size <= 300000 AND size >= 250000;
SELECT * FROM files WHERE size >= 300000 AND size <= 350000;
SELECT * FROM files WHERE size >= 800000 AND size <= 900000;
``

1. Query for the btree index that combines dir_path + name into a full path:
``
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-%';
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-02-02-11.mp4%';
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/%';``

Notice: Index scans and bitmap scans can be turned off, for easier comparisons
``SET enable_indexscan TO false;
    SET enable_bitmapscan TO false;``

#### Index Sizes
Index Sizes for the tree structured file dump (634.113 files ~750 MB)

1. Gin: 230 MB
1. Gin jsonb_path_ops: 78 MB
1. Btree metadata->>'FileName': 23 MB
1. Btree files.name: 23 MB
1. Btree files.size: 14 MB
1. Btree on fullpath: 79 MB

#### Index query times
Testing index queries on this size of a test set with 634.113 files.
```console

**************
Start index test!
Query Iterations: 50
------ Gin Default
---------------------
SELECT * FROM files WHERE metadata ? 'Format';
-------------------------------------------------------------
Average Time Sequential :  892014438 nano_sec | 892 m_sec
Average Time Index :  550154438 nano_sec | 550 m_sec
Index Speed Up:  341860000 nano_sec | 341 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata ?& array['Format', 'Balance', 'HistoryWhen', 'MajorBrand'];
-------------------------------------------------------------
Average Time Sequential :  673821447 nano_sec | 673 m_sec
Average Time Index :  142473946 nano_sec | 142 m_sec
Index Speed Up:  531347501 nano_sec | 531 m_sec
-------------------------------------------------------------
------ Gin Jsonb Path Ops
-------------------------
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}';
-------------------------------------------------------------
Average Time Sequential :  6625244539 nano_sec | 6625 m_sec
Average Time Index :  7362793814 nano_sec | 7362 m_sec
Index Speed Up:  -737549275 nano_sec | -737 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg", "BitsPerSample": 8, "FilePermissions": 770, "YCbCrSubSampling": "2 2"}';
-------------------------------------------------------------
Average Time Sequential :  6833730754 nano_sec | 6833 m_sec
Average Time Index :  7084670421 nano_sec | 7084 m_sec
Index Speed Up:  -250939667 nano_sec | -250 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg", "BitsPerSample": 8, "FilePermissions": 770, "YCbCrSubSampling": "2 2", "ImageSize": "78 78", "YResolution": 1, "ColorComponents": 3, "EncodingProcess": 0, "Megapixels": 0.006084}';
-------------------------------------------------------------
Average Time Sequential :  612842018 nano_sec | 612 m_sec
Average Time Index :  10013388 nano_sec | 10 m_sec
Index Speed Up:  602828630 nano_sec | 602 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata @> '{"MIMEType":"image/jpeg"}' AND metadata @> '{"BitsPerSample": 8}' AND metadata @> '{"FilePermissions": 770}'AND metadata @> '{"YCbCrSubSampling": "2 2"}' AND metadata @> '{"ImageSize": "78 78"}' AND metadata @> '{"YResolution": 1}'AND metadata @> '{"ColorComponents": 3}' AND metadata @> '{"EncodingProcess": 0}' AND metadata @> '{"Megapixels": 0.006084}';
-------------------------------------------------------------
Average Time Sequential :  581903311 nano_sec | 581 m_sec
Average Time Index :  6119124 nano_sec | 6 m_sec
Index Speed Up:  575784187 nano_sec | 575 m_sec
-------------------------------------------------------------
------ Btree metadata ->>'FileName'
------------------------------------
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-01-01-01-11.mp4%';
-------------------------------------------------------------
Average Time Sequential :  522709841 nano_sec | 522 m_sec
Average Time Index :  441921 nano_sec | 0 m_sec
Index Speed Up:  522267920 nano_sec | 522 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-%';
-------------------------------------------------------------
Average Time Sequential :  544038048 nano_sec | 544 m_sec
Average Time Index :  9413645 nano_sec | 9 m_sec
Index Speed Up:  534624403 nano_sec | 534 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-%';
-------------------------------------------------------------
Average Time Sequential :  549209102 nano_sec | 549 m_sec
Average Time Index :  93229405 nano_sec | 93 m_sec
Index Speed Up:  455979697 nano_sec | 455 m_sec
-------------------------------------------------------------
----- Btree files.name
-----------------------
SELECT * FROM files WHERE name LIKE '01-02-01-01-01-01-11.mp4%';
-------------------------------------------------------------
Average Time Sequential :  434220971 nano_sec | 434 m_sec
Average Time Index :  479034 nano_sec | 0 m_sec
Index Speed Up:  433741937 nano_sec | 433 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE name LIKE '01-02-01-%';
-------------------------------------------------------------
Average Time Sequential :  445438587 nano_sec | 445 m_sec
Average Time Index :  8026799 nano_sec | 8 m_sec
Index Speed Up:  437411788 nano_sec | 437 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE name LIKE '01-%';
-------------------------------------------------------------
Average Time Sequential :  400890635 nano_sec | 400 m_sec
Average Time Index :  83330892 nano_sec | 83 m_sec
Index Speed Up:  317559743 nano_sec | 317 m_sec
-------------------------------------------------------------
----- Btree files.size
-----------------------
SELECT * FROM files WHERE size <= 300000 AND size >= 250000;
-------------------------------------------------------------
Average Time Sequential :  439070238 nano_sec | 439 m_sec
Average Time Index :  12514012 nano_sec | 12 m_sec
Index Speed Up:  426556226 nano_sec | 426 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 300000 AND size <= 350000;
-------------------------------------------------------------
Average Time Sequential :  418009961 nano_sec | 418 m_sec
Average Time Index :  11564856 nano_sec | 11 m_sec
Index Speed Up:  406445105 nano_sec | 406 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 800000 AND size <= 900000;
-------------------------------------------------------------
Average Time Sequential :  414523061 nano_sec | 414 m_sec
Average Time Index :  803663 nano_sec | 0 m_sec
Index Speed Up:  413719398 nano_sec | 413 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE size >= 800000;
-------------------------------------------------------------
Average Time Sequential :  388975604 nano_sec | 388 m_sec
Average Time Index :  120863600 nano_sec | 120 m_sec
Index Speed Up:  268112004 nano_sec | 268 m_sec
-------------------------------------------------------------
----- Btree fullpath
-----------------------
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/0%';
-------------------------------------------------------------
Average Time Sequential :  378368253 nano_sec | 378 m_sec
Average Time Index :  8651260 nano_sec | 8 m_sec
Index Speed Up:  369716993 nano_sec | 369 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-%';
-------------------------------------------------------------
Average Time Sequential :  481640188 nano_sec | 481 m_sec
Average Time Index :  1670018 nano_sec | 1 m_sec
Index Speed Up:  479970170 nano_sec | 479 m_sec
-------------------------------------------------------------
SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-02-02-11.mp4%';
-------------------------------------------------------------
Average Time Sequential :  511178462 nano_sec | 511 m_sec
Average Time Index :  1240942 nano_sec | 1 m_sec
Index Speed Up:  509937520 nano_sec | 509 m_sec
-------------------------------------------------------------
End index test!
**************
```

### Index Insertion Times
Insertion Times tested with 17.458 files

1. no index:                                                   118.563 sec
1. gin index on files.metadata:                                119.177 sec
1. gin index with the jsonb_path_ops operator:                 119.345 sec
1. btree index on metadata->>FileName:                         120.473 sec
1. btree index on files.name:                                  119.491 sec
1. btree index on files.size:                                  121.083 sec
1. btree index that combines dir_path + name into a full path: 122.049 sec

Insertion Times tested with 663,645 files

1. no index:                                                   1540.74 sec
1. gin index on files.metadata:                                1811.34 sec
1. gin index with the jsonb_path_ops operator:                 5376.05 sec
1. btree index on metadata->>FileName:                         1795.60 sec
1. btree index on files.name:                                  1617.96 sec
1. btree index on files.size:                                  4342.36 sec
1. btree index that combines dir_path + name into a full path: 1588.51 sec

The insertion times of the crawler with and without the indexes can be found [here](https://drive.google.com/drive/folders/1_ZKsWZbUbNF59RixjDvktCSrTypWAz7w)

### Summary
Insertion times don't get significantly slowed down by one index,
but useless indexes still shouldn't get added as they not only slow insertion and update times down a bit,
they also take up additional space.

Most of the time when the indexes get used they speed up the time, and then they most of the time speed up the query significantly.

The biggest question is if our queries can actually use these indexes or if sequential searches will be faster.
It depends alot on what kind of queries get used.

The gin indexes can be useful, but our sql queries probably need to be rewritten to use them.
A bTree index on metadata->>FileName is pretty much similar to a bTree index on the files.name field.
bTree indexes could also be used on other metadata attributes, but I don't have one in my mind right now that isn't, yet it's own field in our database table.
For file sizes they can be useful, especially with smaller ranges.

Right now we're using and SQL Statements like this "LIKE '%name%'", with both of those '%'-wildcards added, the indexes can't get used.
With only one wildcard at the start or end they could work but then the functionality of the query would change.

So without knowing which exact queries get used, it's hard to say if we can benefit from some indexes or if they would just be additional baggage.

On which attributes should we use indexes:
file id isn't of real interest now.
crawl id neither, because we don't join tables a lot.
For file name, dir_path they are useful if we only use one wildcard in the sql statement,
 for file size they are useful,  file type isn't specific enough for indexes.
The different dates aren't so interesting according to our IP, that means we probably shouldn't use an index here.
Maybe we can make use of the gin indexes, if we change our queries.
At this moment I don't see a metadata attribute, where a bTree index is useful.
We could maybe use indexes on file_hash and deleted_time if it helps the crawler side.
If we use the file hashes a hash index on that field is probably really useful.

<br>
<br>

[interesting](http://bitnine.net/blog-postgresql/postgresql-internals-jsonb-type-and-its-indexes/?ckattempt=1)





