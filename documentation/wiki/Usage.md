### Crawler

Each endpoint except ``/config`` will send its response in JSON format.
On success, the response will be the default message ``{"message": OK}``.
On failure, the response will be ``{"error": <description>}`` with
*description* being the description of the failure that occured.

#### How to start the crawler

The crawler can be started using the web UI
([GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-config.gif),
[PNG](https://raw.githubusercontent.com/amos-project2/metadata-hub/bc74f86a2777819d6a70187de3aa4a1d7b9691a1/documentation/images/crawler/crawler_config.png))
or the REST interface
([GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-start.gif)).
The web UI displays a success/error message on success/failure.

#### How to get status information

Navigate to ``/info`` and the status will be displayed as JSON data
([PNG](https://raw.githubusercontent.com/amos-project2/metadata-hub/bc74f86a2777819d6a70187de3aa4a1d7b9691a1/documentation/images/crawler/crawler_info.png),
[GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-info.gif)).

#### How to stop the crawler

Navigate to ``/stop`` and the current execution will be stopped
([PNG](https://raw.githubusercontent.com/amos-project2/metadata-hub/bc74f86a2777819d6a70187de3aa4a1d7b9691a1/documentation/images/crawler/crawler_stop_success.png),
[GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-stop.gif)).
Here is an example for an error message
([PNG](https://raw.githubusercontent.com/amos-project2/metadata-hub/bc74f86a2777819d6a70187de3aa4a1d7b9691a1/documentation/images/crawler/crawler_stop_failure.png))

#### How to pause the crawler

Navigate to ``/pause`` and the current execution will be paused
([GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-pause.gif)).


#### How to continue the crawler

Navigate to ``/continue`` and the current execution will be continued
([GIF](https://raw.githubusercontent.com/amos-project2/metadata-hub/eda6d067e7121ea233456067e1e84e53a50aa9c1/documentation/gifs/crawler-continue.gif)).
