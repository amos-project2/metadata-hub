from multiprocessing import Queue


# Queues for communication with the manager
manager_queue_input = Queue()
manager_queue_output = Queue()

# Queues for communication with the database updater
database_updater_input = Queue()
