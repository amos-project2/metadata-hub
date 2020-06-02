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
A very simple GraphQL query looks like this:

A more complicated GraphQL query looks like this:

##Web User Interface


