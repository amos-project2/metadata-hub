"""Interface for interacting with the tree walk.

This interface is required for the API to interact with the tree walk component.
The API in turn provides an interface for the outside to interact with the
crawler. If a request is made, the API adds a corresponding item into the
working queue so the tree walk can process the request.
"""


# Python imports
import logging
from typing import Tuple


# Local imports
from crawler.services.config import Config
import crawler.communication as communication


def start(config: Config) -> communication.Response:
    """Start the TreeWalk.

    Args:
        config (Config): new configuration

    Returns:
        communication.Response: response object

    """
    if config.get_force_update():
        logging.info('TWManagerInterface: force-update was set. stopping.')
        command = communication.Command(
            command=communication.MANAGER_STOP,
            data=None
        )
        communication.manager_queue_input.put(command)
        # Ignore response of command stop
        _ = communication.manager_queue_output.get()
    command = communication.Command(
        command=communication.MANAGER_START,
        data=config
    )
    communication.manager_queue_input.put(command)
    return communication.manager_queue_output.get()


def pause() -> communication.Response:
    """Pause the TreeWalk.

    Returns:
        communication.Response: response object

    """
    command = communication.Command(
        command=communication.MANAGER_PAUSE,
        data=None
    )
    communication.manager_queue_input.put(command)
    return communication.manager_queue_output.get()


def unpause() -> communication.Response:
    """Continue the paused TreeWalk.

    Returns:
        communication.Response: response object

    """
    command = communication.Command(
        command=communication.MANAGER_UNPAUSE,
        data=None
    )
    communication.manager_queue_input.put(command)
    return communication.manager_queue_output.get()


def stop() -> communication.Response:
    """Stop the TreeWalk.

    Returns:
        communication.Response: response object

    """
    command = communication.Command(
        command=communication.MANAGER_STOP,
        data=None
    )
    communication.manager_queue_input.put(command)
    return communication.manager_queue_output.get()


def shutdown() -> communication.Response:
    """Retrieve information about the current state  of the TreeWalk.

    Returns:
        communication.Response: response object

    """
    command = communication.Command(
        command=communication.MANAGER_SHUTDOWN,
        data=None
    )
    communication.manager_queue_input.put(command)
    return communication.manager_queue_output.get()
