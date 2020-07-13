"""Abstraction of worker processes

Stores communication events and queues of the corresponding worker process.
Used by the manager class.
"""

# Python imports
import multiprocessing


class WorkerControl:

    def __init__(
        self,
        identifier: int,
        worker: multiprocessing.Process,
        input_data_queue: multiprocessing.Queue,
        input_command_queue: multiprocessing.Queue,
        event_self: multiprocessing.Event,
        event_manager: multiprocessing.Event,
        event_finished: multiprocessing.Event
    ):
        self.identifier = identifier
        self.me = worker
        self.data_queue = input_data_queue
        self.command_queue = input_command_queue
        self.event_self = event_self
        self.event_manager = event_manager
        self.event_finished = event_finished
