# Query
## Form-Query
Here you can use a special form to ask for the file-data. You can use there advanced filters and limit the json-output to metadata which you are interessted in.

**The following Inputs are possible:**

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/webui-form-example.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/webui-form-example.png)

* **Query-Name:** _A name for the query, to find this executed query later easier_
* **Owner:** _A name of the owner, which is saved along the name, to see who executed the query_

_The following fields are for limiting the resultset related to different datetimes, the files have_
* **Start-DateTime (File created)**
* **End-DateTime (File created)**
* **Start-DateTime (File modified)**
* **End-DateTime (File modified)**

* **Limit:** _The result contains at maximum limit entries. No input means all entries._

**Filter (List):**

* **Filter-Function:** _The filter function which take place_
 * **Pattern included:** _The attribut-value must contain the value_
 * **Pattern excluded:** _The attribut-value may not contain the value_
 * **Equal:** _The attribut-value must be exaclty the value_
 * **Exists (Attribute):** _The attribut have to exists._
 * **Greater Than:** _The attribut-value must be greater than value_
 * **Lower Than:** _The attribut-value must be lower than value_

[See an Example from the filter](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/gifs/webui/filter-webui.gif)

**Which Attributes (List):**

* **Attribute:** _Here you can insert the Name of an attribute_

[See an Example from the attribute-selection](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/gifs/webui/which-attributes.gif)


If you press the send-button the form-data are converted to a _GraphQL-Query_ in the background. It is sended and you get the result as json. You also can introspect the _GraphQL-Query_, send the query to the _GraphiQL-Console_ for better formatting and changing the query with the help of the _GraphiQl-console_. You also have the possibility to clear the whole form.


## Hash Query
Here you can enter a _file-hash_. If it is in the database, you get all informations about that file. You get all meta-data. Also you get some informations about the _path_ and the _crawl_, which scanned the file.

## GraphQl-Query
Here you can enter _GraphQL-Code_ and execute it. The result is in json.

# GraphiQl
## GraphiQl-Console
Here you can use the _GraphiQl-Console_. It's a editor, where you can enter your GraphQl-Code. Its highlighted.
More options you have there:
* **Get more informations about our used graphQl-Endpoint in the Docu**. (You have to click to the Docu-Button)
* **You can re-exucute old queries. They are cached locally on your computer.**
* **Pretify your entered graphql-code.**
* **Execute the graphql-code and get the result as json.**

More informations about GraphQl and GraphiQL you can find in the [server-section](https://github.com/amos-project2/metadata-hub/wiki/Server).
