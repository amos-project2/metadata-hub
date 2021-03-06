"""Interface for communication with the TreeWalk scheduler.

Provides the abstraction level to safely use from the outside.
"""


# Python imports
from typing import Any


# Local imports
from crawler.services.config import Config
from crawler.services.intervals import TimeInterval
import crawler.communication as communication


def _do_command(command: str, data: Any = None) -> communication.Response:
    """Helper method for passing a command to the scheduler.

    Args:
        command (str): command type
        data (Any, optional): the data required for the command. Defaults to None.

    Returns:
        communication.Response: response

    """
    command = communication.Command(
        command=command,
        data=data
    )
    communication.scheduler_queue_input.put(command)
    response = communication.scheduler_queue_output.get()
    return response


def add_config(config: Config) -> communication.Response:
    """Add a config to the scheduler and its response.

    Args:
        config (Config): configuration of the execution

    Returns:
        communication.Response: reponse object

    """
    return _do_command(
        command=communication.SCHEDULER_ADD_CONFIG,
        data=config
    )


def remove_config(identifier: str) -> communication.Response:
    """Remove the configuration with the given identifier.

    Args:
        identifier (str): identifier of the configuration

    Returns:
        communication.Response: response object

    """
    return _do_command(
        command=communication.SCHEDULER_REMOVE_CONFIG,
        data=identifier
    )


def get_schedule() -> communication.Response:
    """Return the current schedule of the TreeWalk.

    Returns:
        communication.Response: response object

    """
    return _do_command(command=communication.SCHEDULER_GET_SCHEDULE)


def add_interval(interval: TimeInterval) -> communication.Response:
    """Add an interval for maximum resource consumption.

    Args:
        interval (TimeInterval): time interval to add

    Returns:
        communication.Response: response object

    """
    return _do_command(
        command=communication.SCHEDULER_ADD_INTERVAL,
        data=interval
    )


def remove_interval(identifier: str) -> communication.Response:
    """Remove an interval for maximum resource consumption.

    Args:
        identifier (str): identifier of interval to remove

    Returns:
        communication.Response: response object

    """
    return _do_command(
        command=communication.SCHEDULER_REMOVE_INTERVAL,
        data=identifier
    )


def get_intervals() -> communication.Response:
    """Get all present intervals for maximum resource consumption.

    Returns:
        communication.Response: response object

    """
    return _do_command(command=communication.SCHEDULER_GET_INTERVALS)


def shutdown() -> None:
    """Shutdown the TreeWalk scheduler."""
    command = communication.Command(
        command=communication.SCHEDULER_SHUTDOWN,
        data=None
    )
    communication.scheduler_queue_input.put(command)
