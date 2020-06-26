"""Queues for the single threads to communicate with each other.

Since all these queues are used in different threads but the same process,
it is safe to use the queue module
"""


# Python imports
import queue


# Queues for communication with the manager
manager_queue_input = queue.Queue()
manager_queue_output = queue.Queue()

# Queues for communication with the database updater
database_updater_input = queue.Queue()

# Queues for communication with the scheduler
scheduler_queue_input = queue.Queue()
scheduler_queue_output = queue.Queue()
