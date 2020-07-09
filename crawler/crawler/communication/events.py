"""TODO"""

import threading
import multiprocessing
from typing import Tuple


event_db_thread_files_self = threading.Event()
event_db_thread_files_manager = threading.Event()

event_db_thread_metadata_self = threading.Event()
event_db_thread_metadata_manager = threading.Event()


def get_worker_events() -> Tuple[multiprocessing.Event, multiprocessing.Event]:
    """Return communication events for a worker process.

    Returns:
        Tuple[multiprocessing.Event, multiprocessing.Event]:
            event for worker process
            event for manager

    """
    return (multiprocessing.Event(), multiprocessing.Event())
