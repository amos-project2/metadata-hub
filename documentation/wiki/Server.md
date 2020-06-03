# Server
This component uses [GraphQL-Java](https://graphql-java.com) to query the postgreSQL database for file metadata information.
User can directly interact with the API or use the Web User Interface to retrieve metadata information.

## Application Programming Interface
The queries are sent to the http-server using the http POST method.
Port and URI of the server are set by the configuration file (metdatahub/configs/environments.deployment.json).
The default Port is 8080 and the default URI is localhost and the path to the http POST interface is "/graphql".

Using all that information we can now send GraphQL-queries to the server.
When the server is running a GraphiQL test console can be found here: http://localhost:8080/testconsole/
In the console we find information about the querys syntax and what it will retrieve.
For the next two queries we will use the GraphiQL console to demonstrate GraphQL.
* A very simple GraphQL query looks like this:
[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/java_application/documentation/images/server/simple_graphQL.JPG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/java_application/documentation/images/server/simple_graphQL.JPG?raw=true)
```
On the left side we can see the query and on the right the result.
The Query "searchForFileMetadata()" has two Arguments, a list of file ids and a list of metadata attributes we want to have returned.
In the curly brackets there are even more fields, like name, id, metadata, they are fields of the object "File"
 and they define how the result will look like.
"metadata" is a field of "File" but its a object on its own so we have to define again
in which fields of metadata we are interested in, in our example that is the name and value field.
```
A more complicated GraphQL query looks like this:
[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/complicated_graphQL.PNG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/complicated_graphQL.PNG?raw=true)
```
Now our new query has 6 arguments.
The values we have set for start_creation_time and end_creation_time only return files, which were exactly created at "2020-06-02 03:05:45".
The three lists metadata_attributes, metadata_values and metadata_options are related to each other.
In this example we look for all Files that have a metadata attribute of "ImageWidth" that has a value which is smaller than "4000".
And all Files that have a "Filetype" attribute which have the pattern "GIF" included in their value.
The list of selected_attributes specifies that we are only interested in the metadata attributes "ImageWidth", "Filter" and "Duration".
Those are the only ones that are returned to us by the query.

The searchForFileMetadata query returns an Object Type named "File" and now we have specified
that the query reutrns all the fields of "File".
("id", "crawl_id", "dir_path", "name", "type", "creation_time", ... , "metadata")
```

### GraphQL Schema

## Web User Interface
Using the Web UI a User can send queries in GraphQL syntax, but it also provides a form query, where different search options
can be used without knowing GraphQL syntax. More information about the Web UI can be found in its own documentation page.


