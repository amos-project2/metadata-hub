"""Definition of the state of the TreeWalk.

The state is defined by the status, the current config and the corresponding
work packages.
"""


# Python imports
from typing import List


# Local imports
from crawler.services.config import Config


class StateException(Exception):
    """Exception for invalid state combinations."""
    pass


class State:

    # TreeWalk is ready
    READY = 'ready'

    # TreeWalk is paused
    PAUSED = 'paused'

    # TreeWalk is running
    RUNNING = 'running'


    def __init__(self):
        self._status = State.READY
        self._config = None


    def get_status(self) -> str:
        """Return the current state.

        Returns:
            str: current state
        """
        return self._status


    def get_config(self) -> Config:
        """Return the current configuration.

        Returns:
            Config: current configuration

        """
        if self._config is None:
            return None
        return self._config.get_data()


    def is_running(self) -> bool:
        """Return if the current state is running.

        Returns:
            bool: True if state is running, False otherwise

        """
        return self._status == State.RUNNING


    def is_paused(self) -> bool:
        """Return if the current state is paused.

        Returns:
            bool: True if state is paused, False otherwise

        """
        return self._status == State.PAUSED


    def is_ready(self) -> bool:
        """Return if the current state is ready.

        Returns:
            bool: True if state is ready, False otherwise

        """
        return self._status == State.READY


    def set_running(self, config: Config) -> None:
        """Set the state to running.

        Args:
            config (Config): new configuration of TreeWalk

        Raises:
            StateException: if status is not ready beforehand

        """
        if self._status != State.READY:
            raise StateException(
                f'Cannot change from {self._status} to {State.READY}'
            )
        self._status = State.RUNNING
        self._config = config


    def set_paused(self) -> None:
        """Set the state to paused.

        Raises:
            StateException: if status is not running beforehand

        """
        if self._status != State.RUNNING:
            raise StateException(
                f'Cannot change from {self._status} to {State.PAUSED}'
            )
        self._status = State.PAUSED


    def set_unpaused(self) -> None:
        """Set the state to running again.

        Raises:
            StateException: if status is not paused beforehand

        """
        if self._status != State.PAUSED:
            raise StateException(
                f'Cannot continue from {self._status}.'
            )
        self._status = State.RUNNING


    def set_ready(self) -> None:
        """Set status to ready."""
        self._config = None
        self._status = State.READY
