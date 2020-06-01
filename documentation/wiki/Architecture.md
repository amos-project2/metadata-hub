This chapter provides a short overview about the conceptual architecture
of the Metadata-Hub application.
It aims to give a high-level understanding of the structure of the application
rather than a detailled description of its components.
For a more detailed documentiation, please refer to the
[Documentation](https://github.com/amos-project2/metadata-hub/wiki/Documentation)
chapter.

The Metadata-Hub application consists of three major components that are listed
below.

* **Crawler**<br>
  This component implements the tree walk algorithm which crawls the
  target directories/filesystems.
  The tree walk can be manually configured, e.g. input directories or rough CPU restrictions.
  It extracts metadata of the traversed files with the
  [ExifTool](https://exiftool.org/) and stores this data in the database.
  Furthermore, it stores state about its execution(s) such that the tree walk
  can be initialized with already traced data or being paused/continued.

* **Server**<br>
  This component provides an interface for queries about the metadata.
  It uses [GraphQL](https://graphql.org/) as the query language.
  Furthermore, it provides a web interface for the user to create queries
  without too detailed technical knowledge.

* **Database**<br>
  This component is responsible for persisting the metadata.
  The used database is [PostgreSQL](https://www.postgresql.org).
  Furthermore, it is used to store state about executions of the tree walk
  for the controlling mechanism.

The interaction of these components is depicted in the following graphic
and explained below.

``TODO`` **ADD PICTURE**

Both the server and the crawler communicate with the database.
Both the server and the crawler are accessible via the user's web browser.
The database itself isn't required to be accessed directly by the user.
