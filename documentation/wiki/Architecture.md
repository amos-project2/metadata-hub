This chapter provides a short overview about the conceptual architecture
of the Metadata-Hub application.
It aims to give a high-level understanding of the structure of the application
rather than a detailled description of its components.
For a more detailed documentiation, please refer to the
[Documentation](https://github.com/amos-project2/metadata-hub/wiki/Documentation)
chapter.

The Metadata-Hub application consists of three major components that are listed
below.

* **TreeWalk**<br>
  This component implements the TreeWalk algorithm which crawls the
  target directories/filesystems and stores the by the
  [ExifTool](https://exiftool.org/) extracted metadata in the database.
  The TreeWalk supports scheduled and periodic executions and controlling
  mechanism such as pausing, continuing and stopping running executions.

* **MdH-WebUI/Query-Server**<br>
  The MdH-WebUI/Query-Server provides the interface for metadata queries and
  the controlling of the TreeWalk.
  It uses [GraphQL](https://graphql.org/) as the query language.
  Furthermore, it supports queries to be stored and executed again as well
  as exporting the retrieved results as JSON files.

* **Database**<br>
  The metadata and additional stateful information for the TreeWalk is stored
  in a [PostgreSQL](https://www.postgresql.org) database.

The interaction of these components is depicted in the following graphic.
The user/admin use the web interface provided by the MdH-WebUI/Query-Server
to query metadata and configure the TreeWalk.

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/cde5383152db99ee656f34d4170a88311bad3c15/documentation/images/architecture_prev.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/cde5383152db99ee656f34d4170a88311bad3c15/documentation/images/architecture.png)
