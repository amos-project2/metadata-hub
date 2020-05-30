"""Interface for interacting with the tree walk.

This interface is required for the API to interact with the tree walk component.
The API in turn provides an interface for the outside to interact with the
crawler. If a request is made, the API adds a corresponding item into the
working queue so the tree walk can process the request.
"""


# Python imports
import logging
from queue import Queue
from typing import Tuple


# Local imports
from crawler.services.config import Config
from crawler.treewalk.manager import TreeWalkManager


# Globals (module)
_response = Queue()
_config_queue = Queue()
_command_queue = Queue()
_manager = TreeWalkManager()
_logger = logging.getLogger(__name__)


def run() -> None:
    """Run the tree walk component.

    Wait for configurations to process provided by the API.

    """
    while True:
        command = _command_queue.get()
        if command == TreeWalkManager.COMMAND_START:
            _logger.info(f'Starting TreeWalk with given config.')
            config = _config_queue.get()
            response = _manager.start(config)
        if command == TreeWalkManager.COMMAND_PAUSE:
            _logger.info(f'Pausing current execution of TreeWalk.')
            response = _manager.pause()
        if command == TreeWalkManager.COMMAND_UNPAUSE:
            _logger.info(f'Continuing paused execution of TreeWalk.')
            response = _manager.unpause()
        if command == TreeWalkManager.COMMAND_STOP:
            _logger.info(f'Stopping TreeWalk.')
            response = _manager.stop()
        if command == TreeWalkManager.COMMAND_INFO:
            _logger.info(f'Providing info about TreeWalk state.')
            response = _manager.info()
        if command == TreeWalkManager.COMMAND_SHUTDOWN:
            _logger.info(f'Shutting TreeWalk down.')
            response = _manager.stop()
            break
        _response.put((response, command))
    _logger.info(f'Exiting TreeWalk interface.')
    _response.put((response, command))


def start(config: Config) -> None:
    """Start the TreeWalk.

    Args:
        config (Config): new configuration

    """
    _config_queue.put(config)
    _command_queue.put(TreeWalkManager.COMMAND_START)


def pause() -> None:
    """Pause the TreeWalk."""
    _command_queue.put(TreeWalkManager.COMMAND_PAUSE)


def unpause() -> None:
    """Continue the paused TreeWalk."""
    _command_queue.put(TreeWalkManager.COMMAND_UNPAUSE)


def stop() -> None:
    """Stop the TreeWalk."""
    _command_queue.put(TreeWalkManager.COMMAND_STOP)


def info() -> None:
    """Info about the TreeWalk.

    Information can be pulled via the get_response function.

    """
    _command_queue.put(TreeWalkManager.COMMAND_INFO)


def shutdown():
    """Terminate the TreeWalk."""
    _command_queue.put(TreeWalkManager.COMMAND_SHUTDOWN)


def get_response() -> Tuple[bool, str, str]:
    """Get the response of the last command.

    The info command does not return the default OK message on success but
    a dict in any case, so it needs an extra check.

    Returns:
        Tuple[bool, str, str]:
            True on success, False on failure
            response message
            command

    """
    respone_msg, command = _response.get()
    if command == TreeWalkManager.COMMAND_INFO:
        result = (True, respone_msg, command)
    else:
        status = respone_msg == TreeWalkManager.RESPONSE_OK
        result = (status, respone_msg, command)
    return result
