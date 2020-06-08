# Server
This component uses [GraphQL-Java](https://graphql-java.com) to query the postgreSQL database for file metadata information.
User can directly interact with the API or use the Web User Interface to retrieve metadata information.

## Application Programming Interface
The GraphQL queries are sent to the http-server using the http POST method.
Port and URI of the server are set by the configuration file (metdatahub/configs/environments.deployment.json).
The default Port is 8080, and the default URI is localhost, and the path to the http POST interface is "/graphql".

Using all that information we can now send GraphQL-queries to the server.
When the server is running a GraphiQL test console can be found here: http://localhost:8080/testconsole/
In the console we find information about the querys syntax and what it will retrieve.
For the next two queries we will use the GraphiQL console to demonstrate GraphQL.
* A very simple GraphQL query looks like this:
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/simple_graphQL.JPG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/simple_graphQL.JPG)
```
On the left side we can see the query and on the right the result.
The Query "searchForFileMetadata()" has two Arguments, a list of file ids and a list of metadata attributes we want to have returned.
In the curly brackets there are even more fields, like name, id, metadata, they are fields of the object "File"
 and they define how the result will look like.
"metadata" is a field of "File" but its a object on its own so we have to define again
in which fields of metadata we are interested in, in our example that is the name and value field.
```

A more complicated GraphQL query looks like this:
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/complicated_graphQL.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/complicated_graphQL.PNG)

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

Now we will take a closer look at the GraphQL Schema which defines the syntax of our query.
Only the most important information is displayed here.
The exact schema can be found in /metadata-hub/server/src/main/resources/schema.graphqls

#### File

[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/File.PNG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/File.PNG?raw=true)

"File" is our object type which gets returned by the query searchForFileMeta() and represents our files in the server.
It has different fields which are also represented in some way in the database.
Most metadata will be in the field "metadata", which is a list of "Metadatum" Object Types. The "Metadatum" Object Type can be seen directly below.
#### Metadatum

[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/Metadatum.PNG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/Metadatum.PNG?raw=true)

"Metadatum" is the object type that represents one metadatum of a file.
#### searchForFileMetadata()
[![Ooops, there should be an image :(](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/searchForMetadata.PNG?raw=true)](https://github.com/amos-project2/metadata-hub/blob/develop/documentation/images/server/searchForMetadata.PNG?raw=true)

"searchForFileMetadata()" is our only GraphQL query, and it offers a lot of options to specify which file metadata we want to have returned.
Using the options metadata_attributes, metadata_values, metadata_options it can query for any metadatum using the specified options.
An example can be seen above, in the "complicated GraphQL" query example.
```
searchForFileMetadata:
    Searches for all file metadata dependent on the specified search options.
    If no options are specified, all file metadata is returned.

    Search Options:
    file_id: Only returns file metadata belonging to one of the file ids in the list.
    crawl_id: Only returns file metadata belonging to one of the crawl ids in the list.
    dir_path: Only returns file metadata where their directory path matches the specified pattern.
        Default PatternOption is "included".
    dir_path_option: Different PatternOptions can be used, which change how "dir_path" gets compared to other Strings.
    file_name: Only returns file metadata where their file_name matches the specified pattern.
        Default PatternOption is "included"
    file_name_option: Different PatternOptions can be used, which change how "file_name" gets compared to other Strings.
    file_type: Only returns file metadate where the file type is exactly "file_type"
    size: Only returns file metadata of a certain size depending on the used IntOption. Default IntOption is "equal".
    size_option: Here the IntOption for "size" can be specified.
    !Notice to timestamps!: timestamps follow the ISO 8601 standard, e.g. "2004-10-19 10:23:54+02", if no timezone is specified
        it is assumed to be in the system's timezone, if no time is specified "00:00:00" is used.
    start_creation_time: Only returns file metadata, which got created later or at the same point as "start_creation_time".
    end_creation_time: Only returns file metadata, which got created earlier than "end_creation_time".
    start_access_time: Only returns file metadata, which got accessed later or at the same point as "start_access_time".
    end_access_time: Only returns file metadata, which got accessed earlier than "end_access_time".
    start_modification_time: Only returns file metadata, which got modified later or at the same point as "start_modification_time".
    end_modification_time: Only returns file metadata, which got modified earlier than "end_modification_time".
    file_hash: Only returns file metadata where the file has the same sha_254 hash as the hashes in the list.
    metadata_attributes: (see in metadata_values)
    metadata_values: Only returns file metadata, where the file has the attribute specified in
        metadata_attributes and its value matches the value of metadata_values. Different PatternOptions can be used.
        Both lists have to be the same length as their ordering relates them to each other.
        Default PatternOption is "included".
    metadata_options: Different PatternOptions can be used for metadata_values. The index in metadata_option relates to the index
        in meta_data_values e.g. metadata_option[1] will be used for metadata_value[1]. If used both lists need to have the same length.
    selected_attributes: For all file metadata only the specified metadata attributes are returned.
    limitFetchingSize: Limits how many files will get fetched by the search.
```
###MetadataOption
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/server_metadata_option.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/f137a84ebb7c7d10349c14ef065435de22ca475d/documentation/images/server/server_metadata_option.PNG)
<br>These are the options that can be used on metadata attributes to check for specific values.
````
Different options for checking Strings for patterns:
included: the String has the pattern included
excluded: the String does not! have the pattern included
equal: the String has to exactly match the pattern
bigger: the String has to be lexicographically bigger than the pattern
smaller: the String has to be lexicogarphicaly smaller than the pattern
exists: the String is not NULL
````

## Web User Interface
Using the Web UI a User can send queries in GraphQL syntax, but it also provides a form query, where different search options
can be used without knowing GraphQL syntax. More information about the Web UI can be found in its own documentation page.


