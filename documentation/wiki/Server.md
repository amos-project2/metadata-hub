## MdH-WebUI/Query-Server
This server is written in Java and offers multiple functionalities. It hosts the WebUI, offers a GraphQL API and other functionalities supporting the WebUI. This component uses [GraphQL-Java](https://graphql-java.com) to query the postgreSQL database for file metadata information.
Users can directly interact with the API, use a GraphiQL console, or use the Web User Interface to retrieve metadata information.

## Application Programming Interface
The GraphQL queries are sent to the http-server using the http POST method.
Port and URI of the server are set by the configuration file (metdatahub/configs/environments.deployment.json).
The default Port is 8080, and the default URI is localhost, and the path to the http POST interface is "/graphql".

Using all that information we can now send GraphQL-queries to the server.
When the server is running a GraphiQL test console can be found here: http://localhost:8080/testconsole/
In the console we find information about the query's syntax and what it will retrieve.
GraphiQL offers Syntax highlighting and autocompletion and a documentation of our GraphQL Schema.

### GraphQL Schema

Now we will take a closer look at the GraphQL Schema which defines the syntax of our query.
Only the most important information is displayed here.
The exact schema can be found in /metadata-hub/server/src/main/resources/schema.graphqls and the GraphiQL console also visually presents the schema and it's documentation.

[![GraphiQL not loading](https://github.com/amos-project2/metadata-hub/blob/bfb27bfef101ffa80b34d802f96053b487ff68d8/documentation/images/server/GraphQLUI.PNG?raw=true)](https://raw.githubusercontent.com/amos-project2/metadata-hub/bfb27bfef101ffa80b34d802f96053b487ff68d8/documentation/images/server/GraphQLUI.PNG)

[Video using GraphiQL in the WebUI](https://github.com/amos-project2/metadata-hub/raw/bfb27bfef101ffa80b34d802f96053b487ff68d8/documentation/images/server/GraphiQL-Console.mp4)

#### Query: searchForFileMetadata
"searchForFileMetadata" is the only Query of our Schema. It uses a multitude of arguments to filter out the returned file metadata, additionally it can sort the returned files and only return parts of the result set. This makes it possible to query for the whole set of file metadata in multiple queries.

#### Object Type: ResultSet
"ResultSet" is the Object Type "searchForFileMetadata" returns. "ResultSet" includes information about all the file metadata, occurred errors and what kind of range of the total query it returned.

#### Object Type: File
The Object Type "File" is used for returning information about file metadata. "ResultSet" has a field called "files" which is of the Type File, this is where the file metadata is returned. Most metadata information is stored in its own field "metadata".

## Web User Interface
The server also hosts the WebUI, which offers an easier to use interface for users to send queries but also offers the admin access to the crawler
More information about the WebUI can be found on its own documentation page.

## Supporting Services for the WebUI
The server also offers services to the WebUI that simplify the query construction. It offers the WebUI file type and metadata attribute information for autocompletion, information about the metadata attribute's datatype, downloading the result set as a json file, storing queries and managing File Type Categories, which group different file types together. More information about the WebUI can be found on its own documentation page.

