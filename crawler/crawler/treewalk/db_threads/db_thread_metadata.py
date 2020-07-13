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
            name_thread='DBThreadMetadata',
            name_logger=__name__
        )


    # Methods to implement in child class
    def _combine_dict(self, data: Any) -> dict:
        combined = data[0]
        all_type = {}
        # Subtract each value in decrease for each individual file typ
        for data_type in data[1].keys():
            if data_type in combined.keys():
                for tag_type in data[1][data_type]:
                    if tag_type in data[0][data_type].keys():
                        combined[data_type][tag_type][0] = combined[data_type][tag_type][0] + data[1][data_type][tag_type][0]
                    else:
                        combined[data_type][tag_type] = data[1][data_type][tag_type]
            else:
                combined[data_type] = data[1][data_type]
        # Add the values to the 'ALL'-type
        for data_type in combined.keys():
            for tag_type in combined[data_type].keys():
                if tag_type in all_type.keys():
                    all_type[tag_type][0] = all_type[tag_type][0] + combined[data_type][tag_type][0]
                else:
                    all_type[tag_type] = combined[data_type][tag_type].copy()
        combined['ALL'] = all_type
        return combined

    def _do_work(self, data: Any):
        """Update METADATA table with result from other DB thread.

        Args:
            data (Any): data from other thread
        """
        combined = self._combine_dict(data)
        if combined:
            self._db_connection.update_metadata(combined)

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

