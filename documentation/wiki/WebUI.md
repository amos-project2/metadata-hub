## Form-Query
Here you can use a special form to ask for the file-data. You can use there advanced filters and limit the json-output to metadata which you are interested in.

**The following Inputs are possible:**

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/webui-form-example.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/webui-form-example.png)

* **Query-Name:** _A name for the query, to find this executed query later easier_
* **Owner:** _A name of the owner, which is saved along the name, to see who executed the query_

_The following fields are for limiting the ResultSet related to different DateTimes, the files have_
* **Start-DateTime (File created)**
* **End-DateTime (File created)**
* **Start-DateTime (File modified)**
* **End-DateTime (File modified)**

* **Limit:** _The result contains at maximum limit entries. No input means all entries._

**Filter (List):**

* **Filter-Function:** _The filter function which take place_
 * **Pattern included:** _The attribute-value must contain the value_
 * **Pattern excluded:** _The attribute-value may not contain the value_
 * **Equal:** _The attribute-value must be exactly the value_
 * **Exists (Attribute):** _The attribute has to exist._
 * **Greater Than:** _The attribute-value must be greater than value_
 * **Lower Than:** _The attribute-value must be lower than value_

[See an Example from the filter](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/gifs/webui/filter-webui.gif)

**Which Attributes (List):**

* **Attribute:** _Here you can insert the Name of an attribute_

[See an Example from the attribute-selection](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/gifs/webui/which-attributes.gif)


If you press the send-button the form-data are converted to a _GraphQL-Query_ in the background. It is sent and you get the result as json. You also can introspect the _GraphQL-Query_, send the query to the _GraphiQL-Console_ for better formatting and changing the query with the help of the _GraphiQL-Console_. You also have the possibility to clear the whole form.


## Hash Query
Here you can enter a _file-hash_. If it is in the database, you get all information about that file. You get all meta-data. Also you get some information about the _path_ and the _crawl_, which scanned the file.

## GraphQL-Query
Here you can enter _GraphQL-code_ and execute it. The result is in json.

# GraphiQL
## GraphiQL-Console
Here you can use the _GraphiQL-Console_. It's a editor, where you can enter your GraphQL-code. Its highlighted.
More options you have there:
* **Get more informations about our used GraphQL-Endpoint in the Docu**. (You have to click to the Docu-Button)
* **You can re-exeucute old queries. They are cached locally on your computer.**
* **Prettify your entered GraphQL-code.**
* **Execute the GraphQL-code and get the result as json.**

More information about GraphQL and GraphiQL you can find in the [server-section](https://github.com/amos-project2/metadata-hub/wiki/Server).

# Impressions


**[A short video as overview over the webui](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/gifs/webui/complete-overview.gif)**



**Two pictures about using special metadata attributes in the filter and selection area**

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/specialAttributes.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/specialAttributes.png)

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/specialAttributesResult.png)](https://raw.githubusercontent.com/amos-project2/metadata-hub/develop/documentation/images/webui/specialAttributesResult.png)

