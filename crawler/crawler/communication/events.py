"""Events to share between database threads, workers and manager."""


# Python imports
import threading
import multiprocessing
from typing import Tuple


# Events in the same process
event_db_thread_files_self = threading.Event()
event_db_thread_files_manager = threading.Event()
event_db_thread_metadata_self = threading.Event()
event_db_thread_metadata_manager = threading.Event()


def get_worker_events() -> Tuple[
    multiprocessing.Event, multiprocessing.Event, multiprocessing.Event
]:
    """Return communication events for a worker process.

    Returns:
        Tuple[multiprocessing.Event, multiprocessing.Event]:
            event for worker process
            event for manager
            finished event for the worker

    """
    return (
        multiprocessing.Event(),
        multiprocessing.Event(),
        multiprocessing.Event()
    )
