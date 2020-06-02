### Tree Walk Interface

This section will shortly explain how to access the tree walk interface
, as well as the different configuration options provided.

The interface can be accessed in a web browser, by using the address and port specified while
starting the docker container. The following gif shows an example of the interface:


* [Interface access example](https://raw.githubusercontent.com/amos-project2/metadata-hub/cdd429035c5933281a85758d5feb2e619a6be19c/documentation/gifs/interface_access.gif)


The different options have the following meaning:
* **Input directories**<br>
  This field expects a path to a directory and a corresponding boolean separated by a comma.
  This value determines, if the tree walk is supposed to be executed recursively (If the value is set to true, all
  subdirectories will be scanned). You can also enter multiple pairs, by separating them with
  a semicolon.

  An example input could look like this:

  ``/home/metadata-hub, True; /home/user, false``

* **Output directory**<br>
  This field is deprecated and is used for debugging purposes. Enter a directory path
  in the project folder.

* **Trace file**<br>
  This field is used to input a directory path to a trace file. This file will be used to store data
  on the execution. Visited and completed nodes in the tree walks traversal path will be saved, so future
  tree walk runs can exclude them. This can potentially safe time, if you do not want to analyze directories
  twice.

   An example input could look like this:

  ``/home/metadata-hub/crawler/trace.log``

* **ExifTool**<br>
  This field is used to choose between the linux and windows executables of the exiftool. Pick
  the operating system you are currently working on.

* **Clear trace data before start**<br>
  This field is used to determine, whether the trace.log should be used or not. If yes is picked,
  previously visited node of the directory tree will be skipped. If no is picked, the tree walk will
  traverse the entire directory tree.


* **Power level**<br>
  This field is used to determine how many system resources should be reserved for the tree walk
  execution. 1 provides the system with the minimum amount, 4 with the maximum,

* **Work package size**<br>
  This field represents the value of the desired work packages the crawler will scan. The algorithm attempts
  to evenly split the files of all directories into this size.

* **Update current execution**<br>
  This field determines, if the submission that is about to be sent to the crawler will
  replace the old one. If no is selected the crawler will not accept a new submission and
  prompt the user to wait.


### API

This section will shortly explain the API of the crawler.
All these endpoints support ``GET`` and ``POST`` requests except */info* that only supports ``GET`` requests.

* **/config**<br>
  Create a configuration for the tree walk and start it.
  This endpoint provides the interface described above.
  After submitting the configuration, a success or error page is shown.

* **/start?config={CONFIG}&update=[True]**<br>
  Start the tree walk.
  This is the proper way to start the tree walk in a automated way.
  * ``CONFIG`` (*required*)
  This is the configuration of the execution.
  It can either be a filepath pointing to a valid configuration file or a valid JSON configuration.
  * ``update`` (*optional*)
  By providing *update=True*, a possible running execution will be stopped and
  the new one will be started. Without providing *update* or with *update=False*,
  the request will be ignored if a execution is running/paused.

* **/pause**<br>
  Pause a currently running execution of the tree walk.
  The request will be ignored when the tree walk is currently not running.
  The execution can be continued or stopped later on

* **/continue**<br>
  Continue a paused execution of the tree walk.
  The request will be ignored if the tree walk is not paused.

* **/stop**<br>
  Stop a running or paused execution of the tree walk.
  The request will be ignored if the tree walk is neither paused nor running.

* **/info**<br>
  Retrieve information about the current status of the tree walk.
  Useful to check the status and progress of a possible running execution.

* **/shutdown**<br>
  Shutdown the crawler completely.
  This will force a possible running execution of the tree walk to end
  and exit the crawler process.

