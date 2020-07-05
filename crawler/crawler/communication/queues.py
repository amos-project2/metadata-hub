"""Queues for the single threads/processes to communicate with each other.

The queues for the manager and scheduler use thread-safe queues because they
run in the same process.
The database queues must be accessible from the worker processes, so they
must be process-safe.
"""


# Python imports
import queue
import multiprocessing


# Queues for communication with the manager
manager_queue_input = queue.Queue()
manager_queue_output = queue.Queue()

# Queues for communication with the database updater
database_updater_input = queue.Queue()

# Queues for communication with the scheduler
scheduler_queue_input = queue.Queue()
scheduler_queue_output = queue.Queue()

# Queues for communication with the thread that updates the 'files' table
database_thread_files_input_data = multiprocessing.Queue()
database_thread_files_input_commands= multiprocessing.Queue()

# Queues for communication with the thread that updates the 'metadata' table
database_thread_metadata_input_data = multiprocessing.Queue()
database_thread_metadata_input_commands = multiprocessing.Queue()
