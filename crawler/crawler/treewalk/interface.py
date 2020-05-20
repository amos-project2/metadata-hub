"""Interface for interacting with the tree walk.

This interface is required for the API to interact with the tree walk component.
The API in turn provides an interface for the outside to interact with the
crawler. If a request is made, the API adds a corresponding item into the
working queue so the tree walk can process the request.
"""


# Python imports
import queue


# Local imports
from . import State
import crawler.services.config as config


# Globals
_config_queue = queue.Queue()
_state = State.READY


def run() -> None:
    """Run the tree walk component.

    Wait for configurations to process provided by the API.
    """
    while True:
        config = _config_queue.get()
        _state = State.RUNNING
        # FIXME: Run naive tree walk here
        print(f'Process object {config}')
        _state = State.READY


def get_state() -> str:
    """Return the state the tree walk is currently in.

    Returns:
        str: state of the tree walk
    """
    return _state


def add_config_queue(item: config.Config) -> None:
    """Add a configuration to the queue.

    Args:
        item (config.Config): configuration to add
    """
    _config_queue.put(item)
