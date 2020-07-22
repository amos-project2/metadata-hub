The WebUI has two main parts, one is the constructing and sending of GraphQL-queries to the server, the other one is starting, stopping and scheduling the crawler.

## Query Editor
The Query Editor is an easy to use interface to create GraphQL queries, which can be send to the server to retrieve file metadata. The Query Editor uses filters to reduce the result set of the returned file metadata.

[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/b237ab6498a66a351661d51d6050045d9798c4c6/documentation/images/webui/QueryEditor.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/b237ab6498a66a351661d51d6050045d9798c4c6/documentation/images/webui/QueryEditor.PNG)

[**Video on how to use the Query Editor**](https://github.com/amos-project2/metadata-hub/raw/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/videos/UI-1-QueryEditor.mp4)

## Query Store
The Query Store is used for saving and restoring queries in the Query Editor.
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/QueryStore.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/QueryStore.PNG)

[**Video on how to use the Query Store**](https://github.com/amos-project2/metadata-hub/raw/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/videos/UI-2-QueryStore.mp4)

## File Type Categories
File Type Categories are used to group multiple file types in one category.
They can get selected in the Query Editor, to limit the query to specific file types.
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/FileTypeCategories.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/FileTypeCategories.PNG)

[**Video on how to use the File Type Categories**](https://github.com/amos-project2/metadata-hub/raw/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/videos/UI-3-DateitypKategorien.mp4)

## Hash Query
The Hash Query is only used to check if a file is already in the database. It looks for the sha256-hash of the file in the database, the hash can be manually typed or calculated from a file on disk.

## GraphiQL-Console
The GraphiQL Console is integrated into the WebUI, it offers syntax highlighting, corrections and autocomplete for GraphQL queries depending on the GraphQL Schema. The GraphQL Schema documentation can also be looked at using the console.
More information about GraphQL and GraphiQL can be found in the [server-section](https://github.com/amos-project2/metadata-hub/wiki/Server).

## TreeWalk Controller
The TreeWalk Controller is used for controlling the TreeWalk and its executions.
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/CrawlerController.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/CrawlerController.PNG)

[Video on how to configure a TreeWalk execution.](https://raw.githubusercontent.com/amos-project2/metadata-hub/42d860fbdd9d52669e4bcedc3ede43891bea6efb/documentation/videos/TW-1-Konfiguration.mp4)

[Videon on how to control the TreeWalk](https://raw.githubusercontent.com/amos-project2/metadata-hub/42d860fbdd9d52669e4bcedc3ede43891bea6efb/documentation/videos/TW-2-Ausfuehrung.mp4)

## TreeWalk Scheduler
The TreeWalk Scheduler is used for getting an overview about scheduled TreeWalk executions and removing them from the schedule.
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/Schedule.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/Schedule.PNG)

## TreeWalk Intervals
Intervals are used to create intervals, which can change the maximum resource consumption of the crawler during certain time intervals in a week.
[![Ooops, there should be an image :(](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/Intervals.PNG)](https://raw.githubusercontent.com/amos-project2/metadata-hub/a0dce8044903ed1a7bcf8a977c84a38844a118a4/documentation/images/webui/Intervals.PNG)

[Video on how to configure an interval](https://raw.githubusercontent.com/amos-project2/metadata-hub/42d860fbdd9d52669e4bcedc3ede43891bea6efb/documentation/videos/TW-3-Interval.mp4)


[Video showing the effect of active time intervals on the executions of the TreeWalk](https://raw.githubusercontent.com/amos-project2/metadata-hub/42d860fbdd9d52669e4bcedc3ede43891bea6efb/documentation/videos/TW-4-IntervalAktiv.mp4)

