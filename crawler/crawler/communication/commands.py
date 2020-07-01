"""Definition of commands that are shared between different modules."""


# Return information about the current execution
MANAGER_INFO = 'info'

# Stop the current execution
MANAGER_STOP = 'stop'

# Start a new execution
MANAGER_START = 'start'

# Pause a currently running execution
MANAGER_PAUSE = 'pause'

# Continue a paused execution
MANAGER_UNPAUSE = 'unpause'

# Shutdown the manager
MANAGER_SHUTDOWN = 'shutdown'

# OK response from the manager
MANAGER_OK = 'ok'

# New work package for worker
WORKER_PACKAGE = 'work'

# Pause the worker
WORKER_PAUSE = 'pause'

# Continue the worker
WORKER_UNPAUSE = 'unpause'

# Stop the worker
WORKER_STOP = 'stop'

# Signal the worker to finish
WORKER_FINISH = 'finish'

# Status for database when crawl was stopped
CRAWL_STATUS_ABORTED = 'aborted'

# Status for database when crawl was stopped
CRAWL_STATUS_PAUSED = 'paused'

# Status for database when crawl is running
CRAWL_STATUS_RUNNING = 'running'

# Status for database when crawl is finished
CRAWL_STATUS_FINISHED = 'finished'

# Shutdown the database updater
DATABASE_UPDATER_SHUTDOWN = 'shutdown'

# Add execution to scheduler
SCHEDULER_ADD_CONFIG = 'add-config'

# Remove configuration from scheduler
SCHEDULER_REMOVE_CONFIG = 'remove-config'

# Get scheduled executions from scheduler
SCHEDULER_GET_SCHEDULE = 'get-schedule'

# Shutdown the scheduler
SCHEDULER_SHUTDOWN = 'shutdown'

# Add a interval for max resource consumption
SCHEDULER_ADD_INTERVAL = 'add-interval'

# Remove a interval for max resource consumption
SCHEDULER_REMOVE_INTERVAL = 'remove-interval'

# Get all intervals for max resource consumption
SCHEDULER_GET_INTERVALS = 'get-intervals'
