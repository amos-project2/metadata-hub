"""Database thread that is working on the FILES table."""


# Python imports
import json
import queue
import logging
import datetime
import threading
import multiprocessing
from typing import Any


# Local imports
from .db_thread import DBThread

from crawler.treewalk.worker import utils

import crawler.database as database
import crawler.treewalk as treewalk
import crawler.communication as communication


_logger = logging.getLogger(__name__)


class DBThreadFiles(DBThread):

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            input_data_queue: multiprocessing.Queue,
            input_command_queue: multiprocessing.Queue,
            event_self: threading.Event,
            event_manager: threading.Event,
            tw_state: treewalk.State,
            update_interval: int
    ):
        super(DBThreadFiles, self).__init__(
            db_info=db_info,
            measure_time=measure_time,
            input_data_queue=input_data_queue,
            input_command_queue=input_command_queue,
            event_self=event_self,
            event_manager=event_manager,
            tw_state=tw_state,
            update_interval=update_interval,
            is_files_thread=True,
            name_thread='DBThreadFiles',
            name_logger=__name__
        )

    # Methods to implement in child class

    def _do_work(self, data: Any) -> None:
        """Update FILES table with data from worker processes.

        Args:
            data (Any): output of worker process

        """
        logging.info(f'{self._name} doing work.')
        # Insert each tuple in data into the database
        try:
            # Attempt to insert the results in a batched query
            self._db_connection.insert_new_record_files(data)
        except:
            # Try to insert each file's results individually
            _logger.warning(
                'There was an error inserting the batched results, attempting to insert each file individually.'
            )
            for insert in data:
                try:
                    self._db_connection.insert_new_record_files([insert])
                except:
                    _logger.warning('Failed inserting single file again.')
        logging.debug(f'{self._name} inserted new records.')
        # Tuple to pass to the metadata_thread (increase, decrease)
        # Initiate deletion of the old data
        toDelete = []
        directories = set([x[1] for x in data])
        jsons = []
        try:
            # Determine which files need to be deleted
            for dir in set([x[1] for x in data]):
                file_ids = self._db_connection.check_directory(dir, [x[-2] for x in data])
                if file_ids:
                    toDelete.extend([x[0] for x in file_ids])
                    jsons.extend([x[1] for x in file_ids])
            # Delete the files
            if len(toDelete) > 0:
                # Delete the files
                self._db_connection.delete_files(toDelete)
        except Exception as e:
            print(e)
            self._logger.warning(
                'There was an error setting the deleted tags. Manual check necessary!'
            )
        logging.debug(f'{self._name} creating lists.')
        metadata_list = utils.create_metadata_list([json.loads(j[5]) for j in data])
        metadata_list2 = utils.create_metadata_list(jsons)
        # Pass the dictionary to thread_metadata

        logging.debug(f'{self._name} creating command.')
        command = communication.Command(
            command=communication.DATABASE_THREAD_WORK,
            data=(metadata_list, metadata_list2)
        )
        logging.debug(f'{self._name} putting command.')
        communication.database_thread_metadata_input_data.put(command)
        logging.debug(f'{self._name} finished doing work.')

    def _do_periodic_task(self) -> None:
        """Deleting marked files from FILES table."""
        logging.info(f'{self._name} doing periodic task.')
        # Search for ids that are set to be deleted
        curr_time = datetime.datetime.now()
        to_delete = self._db_connection.get_ids_to_delete()
        to_delete = [
            identifier
            for (identifier, timestamp) in to_delete
            if self._is_to_remove(curr_time=curr_time, remove_time=timestamp)
        ]
        num = self._db_connection.delete_files(ids=to_delete)

    # Override

    def _is_to_remove(
            self,
            curr_time: datetime.datetime,
            remove_time: datetime.datetime
    ) -> bool:
        """Check if the given timestamp exceeds the update interval.

        This method checks if the given timestamp 'remove_time' exceeds
        the current time by the update interval and thus is to be removed.

        Args:
            curr_time (datetime.datetime): current timestamp
            remove_time (datetime.datetime):
                timestamp when the file was marked as to removed

        Returns:
            bool: True if the timestamps exceeds the interval, False otherwise

        """
        if remove_time is None:
            return True
        diff = (curr_time - remove_time).total_seconds()
        if diff >= self._update_interval:
            return True
        return False

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
                self._logger.info(
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
                # Directly access the lock to use the timeout to prevent
                # deadlocks
                lock = self._tw_state._lock.acquire(timeout=0.1)
                if not lock:
                    continue
                if self._finish:
                    self.db_thread_clean_up(
                        close_database=False,
                        finished=self._tw_state.is_running()
                    )
                self._tw_state.release()
                self.db_thread_periodic_task()
                continue
            self._logger.debug(
                f'DBThreadFiles {self._input_data_queue.qsize()} items to process.'
            )
            if command.command == communication.DATABASE_THREAD_FINISH:
                self.db_thread_finish(None)
            else:
                self._do_work(command.data)
            self.db_thread_periodic_task()
        self._logger.info(f'Goodbye thread {self._name}.')
