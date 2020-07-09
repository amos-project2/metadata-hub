"""Definition of the state of the TreeWalk.

The state is defined by the status, the current config and the corresponding
work packages.
"""


# Python imports
import threading
from typing import List, Tuple


# Local imports
import crawler.treewalk as treewalk
from crawler.services.config import Config
import crawler.communication as communication


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

    # TreeWalk is preparing
    PREPARING = 'preparing'

    # TreeWalk is finished
    FINISHED = 'finished'

    # Default value for no CPU restrictions
    MAX_CPU_LEVEL = -1


    def __init__(self):
        self._status = State.READY
        self._config = None # type: Config
        self._lock = threading.Lock()
        self._cpu_level = -1
        self._num_workers = -1
        self._progress = 0
        self._running_workers = 0


    def lock(self) -> None:
        """Lock the TreeWalk state."""
        self._lock.acquire()


    def release(self) -> None:
        """Release the TreeWalk state."""
        self._lock.release()


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


    def is_finished(self) -> bool:
        """Return if the current state is finished.

        Returns:
            bool: True if state is finished, False otherwise

        """
        return self._status == State.FINISHED


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


    def set_finished(self) -> None:
        """Set the state to finished.

        This method directly modifies the state, so it must me ensured
        that the state object is locked properly. This function should be
        only called by the database thread responsible for the files table.

        """
        self._status = State.FINISHED


    def set_running(self, config: Config) -> None:
        """Set the state to running.

        Args:
            config (Config): new configuration of TreeWalk

        Raises:
            StateException: if status is not ready beforehand

        """
        if self._status != State.PREPARING:
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


    def set_preparing(self, config: Config) -> None:
        """Set the state to preparing again.

        Args:
            config (Config): config to prepare

        Raises:
            StateException: if status is not ready beforehand

        """
        if self._status != State.READY:
            raise StateException(
                f'Cannot start from {self._status}.'
            )
        self._status = State.PREPARING
        self._config = config


    def set_ready(self) -> None:
        """Set status to ready."""
        self._config = None
        self._status = State.READY
        self._progress = 0
        self._running_workers = 0


    def set_cpu_level(self, cpu_level: int) -> None:
        """Set the cpu level.

        The CPU level -1 indicates that there are no current restrictions.

        Args:
            cpu_level (int): cpu level

        """
        self._cpu_level = cpu_level
        if self._cpu_level == -1:
            self._num_workers = -1
        else:
            self._num_workers = treewalk.get_number_of_workers(self._cpu_level)


    def get_cpu_level(self) -> Tuple[int, int]:
        """Get the current CPU level and if it must be enforced.

        Returns:
            Tuple[int, bool, int]: CPU level, number of workers

        """
        return (self._cpu_level, self._num_workers)


    def set_progress(self, progress: float) -> None:
        """Set the progress of a running instance.

        Args:
            progress (float): percentage of processed work packages

        """
        self._progress = progress


    def set_running_workers(self, num_workers: int) -> None:
        """Set the number of running worker processes.

        Args:
            num_workers (int): number of running worker processes

        """
        self._running_workers = num_workers


    def info(self) -> communication.Response:
        """Return the current status.

        Returns:
            communication.Response: current info

        """
        if self.is_ready():
            data = {
                'status': self._status,
                'config': self._config,
                'processes': self._running_workers
            }
        else:
            data = {
                'status': self._status,
                'config': self._config.get_data(as_json=False),
                'processes': self._running_workers,
                'progress': self._progress,

            }
        return communication.Response(
            success=True,
            message=data,
            command=communication.MANAGER_INFO
        )
