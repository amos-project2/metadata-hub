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


_logger = logging.getLogger(__name__)


def start(config: Config, update: bool) -> Tuple[bool, str, str]:
    """Start the TreeWalk.

    If update is set to True, a possible running execution will be stopped
    and a new one will be started.

    Args:
        config (Config): new configuration
        update (bool): force update of current execution

    Returns:
        Tuple[bool, str, str]: (status, message, command)

    """
    if update:
        communication.manager_queue_input.put((communication.MANAGER_STOP, None))
        # Ignore response of command stop
        communication.manager_queue_output.get()
    communication.manager_queue_input.put((communication.MANAGER_START, config))
    message, _ = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        message,
        communication.MANAGER_START
    )


def pause() -> Tuple[bool, str, str]:
    """Pause the TreeWalk.

    Returns:
        Tuple[bool, str, str]: (status, message, command)

    """
    communication.manager_queue_input.put((communication.MANAGER_PAUSE, None))
    message, _ = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        message,
        communication.MANAGER_PAUSE
    )


def unpause() -> Tuple[bool, str, str]:
    """Continue the paused TreeWalk.

    Returns:
        Tuple[bool, str, str]: (status, message, command)

    """
    communication.manager_queue_input.put((communication.MANAGER_UNPAUSE, None))
    message, _ = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        message,
        communication.MANAGER_UNPAUSE
    )


def stop() -> Tuple[bool, str, str]:
    """Stop the TreeWalk.

    Returns:
        Tuple[bool, str, str]: (status, message, command)

    """
    communication.manager_queue_input.put((communication.MANAGER_STOP, None))
    message, _ = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        message,
        communication.MANAGER_STOP
    )


def info() -> Tuple[bool, dict, str]:
    """Retrieve information about the current state  of the TreeWalk.

    Returns:
        Tuple[bool, dict, str]: (status, data, command)

    """
    communication.manager_queue_input.put((communication.MANAGER_INFO, None))
    message, data = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        data,
        communication.MANAGER_INFO
    )


def shutdown() -> Tuple[bool, str, str]:
    """Retrieve information about the current state  of the TreeWalk.

    Returns:
        Tuple[bool, str, str]: (status, message, command)

    """
    communication.manager_queue_input.put((communication.MANAGER_SHUTDOWN, None))
    message, _ = communication.manager_queue_output.get()
    return (
        message == communication.MANAGER_OK,
        message,
        communication.MANAGER_SHUTDOWN
    )
