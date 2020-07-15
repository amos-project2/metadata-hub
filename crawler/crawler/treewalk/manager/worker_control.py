"""Abstraction of worker processes

Stores communication events and queues of the corresponding worker process.
Used by the manager class.
"""

# Python imports
import multiprocessing


class WorkerControl:

    def __init__(
        self,
        worker: multiprocessing.Process,
        queue_input: multiprocessing.Queue,
        queue_output: multiprocessing.Queue,
        event_finished: multiprocessing.Event
    ):
        self.me = worker
        self.queue_input = queue_input
        self.queue_output = queue_output
        self.event_finished = event_finished
