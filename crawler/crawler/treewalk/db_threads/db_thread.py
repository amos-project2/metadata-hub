"""TODO"""


# Python imports
import time
import queue
import logging
import threading
import multiprocessing
from typing import Any

# Local imports
from .database_files import DatabaseConnectionTableFiles
from .database_metadata import DatabaseConnectionTableMetadata
import crawler.communication as communication
import crawler.treewalk as treewalk


class DBThread(threading.Thread):

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            input_data_queue: multiprocessing.Queue,
            input_command_queue: multiprocessing.Queue,
            tw_state: treewalk.State,
            update_interval: int,
            is_files_thread: bool,
            name_thread: str,
            name_logger: str
    ):
        super(DBThread, self).__init__()
        self._name = name_thread
        self._logger = logging.getLogger(name_logger)
        self._update_interval = update_interval
        self._input_data_queue = input_data_queue
        self._input_command_queue = input_command_queue
        self._tw_state = tw_state
        self._command = None
        self._last_time_periodic = time.time()
        self._finish = False
        self._shutdown = False
        if is_files_thread:
            self._db_connection = DatabaseConnectionTableFiles(
                db_info=db_info,
                measure_time=measure_time
            )
        else:
            self._db_connection = DatabaseConnectionTableMetadata(
                db_info=db_info,
                measure_time=measure_time
            )
        self._functions = {
            communication.DATABASE_THREAD_STOP: self.db_thread_stop,
            communication.DATABASE_THREAD_PAUSE: self.db_thread_pause,
            communication.DATABASE_THREAD_CONTINUE: self.db_thread_continue,
            communication.DATABASE_THREAD_SHUTDOWN: self.db_thread_shutdown,
            communication.DATABASE_THREAD_FINISH: self.db_thread_finish,
            communication.DATABASE_THREAD_SLEEP: self.db_thread_sleep,
            communication.DATABASE_THREAD_WAKEUP: self.db_thread_wakeup,
        }

    # Methods to implement in child class

    def _do_work(self, data: Any):
        """Override"""
        raise NotImplementedError

    def _do_periodic_task(self) -> None:
        """Override"""
        raise NotImplementedError

    # Base class

    @staticmethod
    def clear_queue(my_queue) -> None:
        """Clear a multiprocessing queue completely.

        Args:
            my_queue (multiprocessing.queue): queue to clear

        """
        while True:
            try:
                my_queue.get(block=False)
            except queue.Empty:
                return

    def db_thread_stop(self, data: Any) -> None:
        """Stop the thread

        Args:
            data (Any): not required

        """
        self.db_thread_clean_up(close_database=False, finished=False)

    def db_thread_clean_up(self, close_database: bool, finished: bool) -> None:
        """Clean up the thread.

        Args:
            close_database (bool): closing database desired
            finished (bool): finished (required for Files thread)

        """
        self._logger.debug(f'Thread {self._name} cleaning up.')
        if close_database:
            self._db_connection.close()
        if finished:
            self._tw_state.set_finished()
        self._finish = False
        self._shutdown = False
        DBThread.clear_queue(self._input_data_queue)

    def db_thread_sleep(self, data: Any) -> None:
        """Set the thread to sleep.

        In this state, only wakeup should be called.

        Args:
            data (Any): not required

        """
        self._logger.info(f'{self._name} going to sleep.')
        command = self._input_command_queue.get(block=True)
        self._command = command.command
        self._functions[self._command](command.data)

    def db_thread_wakeup(self, data: Any) -> None:
        """Wake up the thread (simply skips the blocking queue wait).

        Args:
            data (Any): not required

        """
        self._logger.info(f'{self._name} waking up.')

    def db_thread_pause(self, data: Any) -> None:
        """Pause the thread.

        In this state, only stop, shutdown and continue should be called.

        Args:
            data (Any): not required

        """
        command = self._input_command_queue.get(block=True) # type: communication.Command
        self._command = command.command
        self._logger.debug(
            f'DBThread {self._name} running command \'{self._command}\' (paused).'
        )
        self._functions[self._command](command.data)

    def db_thread_continue(self, data: Any) -> None:
        """Continue the thread (skips the blocking queue wait).

        Args:
            data (Any): not required

        """
        self._logger.info(f'{self._name} continuing.')

    def db_thread_shutdown(self, data: Any) -> None:
        """Shutdown the thread.

        Args:
            data (Any): not required

        """
        self.db_thread_clean_up(close_database=True, finished=False)
        self._shutdown = True

    def db_thread_finish(self, data: Any) -> None:
        """Signal from controlling process/thread that work is finished.

        Args:
            data (Any): not required.

        """
        self._finish = True

    def db_thread_periodic_task(self) -> None:
        """Wrapper for running the periodic task."""
        curr = time.time()
        if (curr - self._last_time_periodic) >= self._update_interval:
            self._do_periodic_task()
            self._last_time_periodic = curr
