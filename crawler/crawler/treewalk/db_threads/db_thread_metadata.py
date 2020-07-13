"""Database thread for updating the METADATA table."""

# Python imports
import queue
import logging
import threading
import multiprocessing
from typing import Any

# Local imports
from .db_thread import DBThread
import crawler.database as database
import crawler.communication as communication


class DBThreadMetadata(DBThread):

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            input_data_queue: multiprocessing.Queue,
            input_command_queue: multiprocessing.Queue,
            event_self: threading.Event,
            event_manager: threading.Event,
            update_interval: int
    ):
        super(DBThreadMetadata, self).__init__(
            db_info=db_info,
            measure_time=measure_time,
            input_data_queue=input_data_queue,
            input_command_queue=input_command_queue,
            event_self=event_self,
            event_manager=event_manager,
            tw_state=None,
            update_interval=update_interval,
            is_files_thread=False,
            name_thread='DBThreadMetadata'
        )


    # Methods to implement in child class

    def _do_work(self, data: Any):
        """Update METADATA table with result from other DB thread.

        Args:
            data (Any): data from other thread

        """
        logging.info(f'{self._name}: doing work.')

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
        """


    def _do_periodic_task(self) -> None:
        """Periodic task for the METADATA table."""
        logging.info(f'{self._name}: doing periodic task.')

    # Override

    def run(self) -> None:
        """Run the thread."""
        logging.info(f'{self._name}: Hello thread.')
        while True:
            try:
                command = self._input_command_queue.get(block=False)
                self._command = command.command
                logging.debug(
                    f'{self._name}: running command \'{self._command}\''
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
        logging.info(f'{self._name}: Goodbye thread.')
