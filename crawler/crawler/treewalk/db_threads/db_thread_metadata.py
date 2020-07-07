"""Database thread for updating the METADATA table."""

# Python imports
import queue
import logging
import threading
import multiprocessing
from typing import Any

# Local imports
from .db_thread import DBThread
import crawler.communication as communication
import crawler.crawler.database as database


class DBThreadMetadata(DBThread):

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            input_data_queue: multiprocessing.Queue,
            input_command_queue: multiprocessing.Queue,
            update_interval: int,
            is_files_thread: bool
    ):
        self._name = 'DBThreadMetadata'
        super(DBThreadMetadata, self).__init__(
            db_info=db_info,
            measure_time=measure_time,
            input_data_queue=input_data_queue,
            input_command_queue=input_command_queue,
            tw_state=None,
            update_interval=update_interval,
            is_files_thread=is_files_thread,
            name_thread=self._name,
            name_logger=__name__
        )
        self._db_connection = database.DatabaseConnectionTableMetadata(
            db_info=db_info,
            measure_time=measure_time
        )


    # Methods to implement in child class

    def _do_work(self, data: Any):
        """Update METADATA table with result from other DB thread.

        Args:
            data (Any): data from other thread

        """
        if len(data[1].keys()) > 0:
            # Combine both dictionaries (decrease is always a subset/equal to increase)
            for data_type in data[0].copy().keys():
                increase = data[0][data_type]
                decrease = data[1][data_type]
                for tag in increase.copy().keys():
                    # Subtract the decrease values from increase (if 0: remove as there is nothing to update)
                    if increase[tag][0] - decrease[tag][0] != 0:
                        data[0][data_type][tag] = increase[tag][0] - decrease[tag][0]
                    else:
                        del data[0][data_type][tag]
                if not data[0][data_type]:
                    del data[0][data_type]
        if data[0]:
            self._db_connection.update_metadata(data[0])
        logging.info(f'{self._name} doing work.')


    def _do_periodic_task(self) -> None:
        """Periodic task for the METADATA table."""
        logging.info(f'{self._name} doing periodic task.')

    # Override

    def run(self) -> None:
        """Run the thread."""
        self._logger.info(f'Hello thread {self._name}.')
        while True:
            try:
                command = self._input_command_queue.get(block=False)
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
                command = self._input_data_queue.get(block=False)
            except queue.Empty:
                if self._finish:
                    self.db_thread_clean_up(close_database=False, finished=False)
                self.db_thread_periodic_task()
                continue
            self._do_work(command.data)
            self.db_thread_periodic_task()
        self._logger.info(f'Goodbye thread {self._name}.')

