"""TODO"""


# Python imports
import queue
import logging
import threading
import multiprocessing
from typing import Any


# Local imports
from .db_thread import DBThread
import crawler.communication as communication
import crawler.treewalk as treewalk


class DBThreadFiles(DBThread):

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            input_data_queue: multiprocessing.Queue,
            input_command_queue: multiprocessing.Queue,
            tw_state: treewalk.State,
            update_interval: int,
            is_files_thread: bool
    ):
        self._name = 'DBThreadFiles'
        super(DBThreadFiles, self).__init__(
            db_info=db_info,
            measure_time=measure_time,
            input_data_queue=input_data_queue,
            input_command_queue=input_command_queue,
            tw_state=tw_state,
            update_interval=update_interval,
            is_files_thread=is_files_thread,
            name_thread=self._name,
            name_logger=__name__
        )

    # Methods to implement in child class

    def _do_work(self, data: Any) -> None:
        """Update FILES table with data from worker processes.

        Args:
            data (Any): output of worker process

        """
        logging.info(f'{self._name} doing work.')
        command = communication.Command(
            command=communication.DATABASE_THREAD_WORK, data=data
        )
        communication.database_thread_metadata_input_data.put(command)

    def _do_periodic_task(self) -> None:
        """Deleting marked files from FILES table."""
        logging.info(f'{self._name} doing periodic task.')

    # Override

    def db_thread_finish(self, data: Any) -> None:
        """Finish the files thread.

        Signals the metadata thread that insertion work is done.

        Args:
            data (Any): not required

        """
        self._finish = True
        command = communication.Command(
            command=communication.DATABASE_THREAD_FINISH,
            data=None
        )
        communication.database_thread_metadata_input_commands.put(command)


    def run(self) -> None:
        """Run the thread."""
        self._logger.info(f'Hello thread {self._name}.')
        while True:
            try:
                command = self._input_command_queue.get(block=False) # type: communication.Command
                self._command = command.command
                self._logger.debug(
                    f'DBThread {self._name} running command \'{self._command}\''
                )
                self._functions[self._command](command.data)
                if self._shutdown:
                    break
            except queue.Empty:
                pass
            try:
                command = self._input_data_queue.get(block=False) # type: communication.Command
            except queue.Empty:
                self._tw_state.lock()
                if self._finish:
                    self.db_thread_clean_up(
                        close_database=False,
                        finished=self._tw_state.is_running()
                    )
                self._tw_state.release()
                self.db_thread_periodic_task()
                continue
            if command.command == communication.DATABASE_THREAD_FINISH:
                self.db_thread_finish(None)
            else:
                self._do_work(command.data)
            self.db_thread_periodic_task()
        self._logger.info(f'Goodbye thread {self._name}.')
