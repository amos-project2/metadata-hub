## TreeWalk

This section will shortly explain the interface of the TreeWalk component.
Metadata-Hub provides a web interface for using the TreeWalk component:
* **Controller**<br>
  Interface for controlling (starting/stopping/etc.) the TreeWalk.
* **Schedule**<br>
  Interface for viewing/modifying the schedule of the TreeWalk.
* **Intervals**<br>
  Interface for viewing/modifying the intervals of the TreeWalk.

### Examples

This section will show example pictures of the web interface.
It will be updated until 22nd July.

### Technical overview

This section will shortly describe the technical design of the
TreeWalk component. It will be updated until 22nd July.

### Configuration

The best way to configure a TreeWalk execution is to use the
web interface. Here is a short summary about how to configure
an execution. These help messages are also displayed on the web
interface.

* **Name**<br>
  The name of the configuration. It should be a short name that describes the purpose of the configuration.

* **Author**<br>
  The author of the configuration.

* **Description**<br>
  A more detailed description about the configuration.
  This field is optional.

* **Start**<br>
  Start timestamp of the configuration. It must
  be according to the format ``YY-MM-DD hh:mm:ss``
  e.g. ``2020-07-22 10:15:00``.

* **Interval**<br>
  This defines the interval in which the configuration
  is executed periodically. Input the number of hours
  and days the in which the execution should repeated.
  If the configuration should only be executed once,
  leave both values as ``0``.


* **Directories**<br>
  This field expects a path to a directory and a corresponding boolean separated by a comma.
  This value determines, if the tree walk is supposed to be executed recursively (If the value is set to true, all
  subdirectories will be scanned). You can also enter multiple pairs, by separating them with
  a semicolon.

  An example input could look like this:

  ``/home/metadata-hub, True; /home/user, false``

* **ExifTool**<br>
  This field is used to choose between the linux and windows executables of the ExifTool. Pick
  the operating system you are currently working on.

* **CPU-Level**<br>
  This field is used to determine how many system resources should be reserved for the tree walk
  execution. ``1`` provides the system with the minimum amount,
  ``4`` with the maximum.

* **Package-Size**<br>
  This setting defines how many files are combined in one work package for processing. Directories with a large amount of files are split up and directories with a small amount of files are combined according to this value in order to use the resources more efficently. A very small value for this setting results in TreeWalk being more responsive, e.g. stopping the TreeWalk during execution will be faster. On the other hand, performance will be slowed down due to additional overhead. A large value will result in an opposite behaviour.
  Please provide a number between ``10`` and ``1000`` here.
  A reliable default value is ``100``.

* **Force-Update**<br>
  This field determines, if the submission that is about to be sent to the TreeWalk will replace the old one.
  If ``no`` is selected the TreeWalk will append this execution
  to the schedule.


If you plan to configure the TreeWalk without the web interface,
please have a look at the schema defining the JSON configuration.
This is required for accessing the API of the TreeWalk directly.


### API

This section will shortly explain the API of the TreeWalk.
This is helpful when you plan to use the TreeWalk as a standalone
component.
For the sake of simplicity, all these endpoints support ``GET`` and ``POST`` requests except ``/info`` that only supports ``GET`` requests.

* **/info**<br>
  * Description:<br>
    Retrieve information about the current status of the TreeWalk.
  * Parameters:<br>
    None

* **/start**<br>
  * Description:<br>
    Start the TreeWalk with a certain configuration.
    If the execution cannot be started immediately, it is appended
    to the schedule.
  * Parameters:<br>
    * ``config`` (*required*)<br>
    This is the configuration of the execution.
    It can either be a filepath pointing to a valid configuration file or the string representation of a valid JSON configuration.
    * ``update`` (*optional*)<br>
    By providing *update=True*, a possible running execution will be stopped and
    the new one will be started. Without providing *update* or with *update=False*,
    the request will be appended to the scheudle if an execution is currently running/paused.

* **/pause**<br>
  * Description:<br>
    Pause a currently running execution of the TreeWalk.
    The request will be ignored when the tree walk is currently not running. The execution can be continued or stopped later on.
  * Parameters:<br>
    None

* **/continue**<br>
  * Description:<br>
    Continue a paused execution of the TreeWalk.
    The request will be ignored if the TreeWalk is not paused.
  * Parameters:<br>
    None

* **/stop**<br>
  * Description:<br>
    Stop a running or paused execution of the TreeWalk.
    The request will be ignored if the TreeWalk is ready.
    The execution will be marked as aborted in the database.
  * Parameters:<br>
    None

* **/schedule/list**<br>
  * Description:<br>
    List the current schedule formatted as JSON.
  * Parameters:<br>
    None

* **/schedule/remove**<br>
  * Description:<br>
    Remove an entry of the schedule. On success, the corresponding
    (periodical) execution is removed from the schedule. Otherwise, an error message is returned.
  * Parameters:<br>
    * ``id`` (*required*)<br>
    The unique identifier of the entry. The identifier can be
    retrieved from ``schedule/list`` for example.

* **/intervals/list**<br>
  * Description:<br>
    List all existing intervals for restricting maximum ressource
    consumption.
  * Parameters:<br>
    None

* **/intervals/add**<br>
  * Description:<br>
    Add an interval for restricting maximum ressource consumption.
    If an interval is invalid or conflicts with an already existing one, it is
    not added.
    The timestamps described in the parameter section must be of the form
    ``dd:hh:mm`` with ``dd`` is between ``00`` and ``06`` (specifying the
    weekday), ``hh`` between ``00`` and ``23`` (specifying the hours) and
    ``mm`` between ``00`` and ``59`` (specifying the minutes).
  * Parameters:<br>
    * ``start`` (*required*)<br>
    Start timestamp of the interval.
    * ``end`` (*required*)<br>
    End timestamp of the interval.
    * ``cpu`` (*required*)<br>
    Maximum CPU level during the interval. Must be ``1``, ``2``, ``3`` or ``4``.


* **/schedule/remove**<br>
  * Description:<br>
    Remove an interval. On success, the corresponding interval is removed. Otherwise, an error message is returned.
  * Parameters:<br>
    * ``id`` (*required*)<br>
    The unique identifier of the interval. The identifier can be
    retrieved from ``intervals/list`` for example.

* **/shutdown**<br>
  * Description:<br>
    Shutdown the crawler completely.
    This will force a possible running execution of the TreeWalk to end and exit the TreeWalk process.

