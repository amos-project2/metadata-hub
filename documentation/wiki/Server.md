#Server
This component uses [GraphQL-Java](https://graphql-jave.com) to query the postgreSQL database for file metadata information.
User can directly interact with the API or use the Web User Interface to retrieve metadata information.

##Application Programming Interface
The queries are sent to the http-server using the http POST method.
Port and URI of the server are set by the configuration file (metdatahub/configs/environments.deployment.json).
The default Port is 8080 and the default URI is localhost and the path to the http POST interface is "/graphql".

Using all that information we can now send GraphQL-queries to the server.
When the server is running a GraphiQL test console can be found here: http://localhost:8080/testconsole/
In the console we find information about the querys syntax and what it will retrieve.
* A very simple GraphQL query looks like this:
[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/java_application/documentation/images/server/simple_graphQL.JPG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/java_application/documentation/images/server/simple_graphQL.JPG?raw=true)
```
The Query was executed using the GraphiQL console. On the left side we can see the query and on the right the result.
The Query "searchForFileMetadata()" has two Arguments, a list of file ids and a list of metadata attributes we want to have returned.
In the curly brackets there are even more fields, like name, id, metadata, they are fields of the object "File" and they define how the result will look like.
"metadata" is a field of "File" but its a object on its own so we have to define again in which fields of metadata we are interested in, in our example that is the name and value field.
```
A more complicated GraphQL query looks like this:

##Web User Interface


