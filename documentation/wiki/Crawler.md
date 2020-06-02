* Include a more detailed information about the server component
* Do not reference code, but focus on the major functionality
* For example a further explanation of the API and how to use it




### API

This section will shortly explain the API of the crawler.
All these endpoints support ``GET`` and ``POST`` requests except */info* that only supports ``GET`` requests.

* **/config**<br>
  Create a configuration for the tree walk and start it.
  This let you create the configuration in a web interface and is the prefered way to manually configure the tree walk.
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
