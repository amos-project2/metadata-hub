# Query
## Form-Query
Here you can use a special form to ask for the file-data. You can use there advanced filters and limit the json-output to metadata which you are interessted in.

The following Inputs are possible:

//TODO list of possible inputs


//TODO screenshot

If you press the send-button the form-data are converted to a graphQL-Query in the background. It is sended and you get the result as json. You also can introspect the GraphQL-Query, send the query to the graphiQL-Console for better formatting and changing the query with the help of the graphiql-console. You also have the possibility to clear the whole form.

You can use more than one filters and more than one metadata-attributes you want to have in your json-result.
Here you can see a small example:

//TODO gify

## Hash Query
Here you can enter a file-hash. If it is in the database, you get all informations about that file. You get all meta-data. Also you get some informations about the path and the crawl, which scanned the file.

## GraphQl-Query
Here you can enter graphQL-Code and execute it. The result is in json.

# GraphiQl
## GraphiQl-Console
Here you can use the GraphiQl-Console. It's a editor, where you can enter your graphQl-Code. Its highlighted.
More options you have there:
* Get more informations about our used graphQl-Endpoint in the Docu. (You have to click to the Docu-Button)
* You can re-exucute old queries. They are cached locally on your computer.
* Pretify your entered graphql-code.
* Execute the graphql-code and get the result as json.

//TODO insert link to server and graphiql-documentation in the internet
