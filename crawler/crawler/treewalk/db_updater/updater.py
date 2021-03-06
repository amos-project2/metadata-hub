"""The database updater that periodically removes old files from the database.

The files are marked as to be removed in the database and are still present
for a certain amount of time.
"""


# Python imports
import time
import queue
import logging
import datetime
import threading


# Local imports
from . import database
import crawler.communication as communication
import crawler.services.environment as environment


class DatabaseUpdater(threading.Thread):

    def __init__(self, db_info: dict, measure_time: bool):
        super(DatabaseUpdater, self).__init__()
        self._update_interval = environment.env.CRAWLER_DB_UPDATE_INTERVAL
        self._db_connection = database.DBUpdaterDatabaseConnection(
            db_info=db_info,
            measure_time=measure_time
        )

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


    def run(self) -> None:
        """Run the updater thread.

        The thread sleeps for the specified update interval.
        In each interval, it gets the list of files which are marked as to
        be removed from the database and checks if their timestamps exceed
        the update interval.
        For each file that fulfills this criteria, it removes it from the
        database.
        """
        logging.info(f'DBUpdater: Hello!')
        while True:
            logging.info(
                f'DBUpdater: sleeping for {self._update_interval} seconds.'
            )
            try:
                command = communication.database_updater_input.get(
                    block=True,
                    timeout=self._update_interval
                )
                if command.command == communication.DATABASE_UPDATER_SHUTDOWN:
                    break
            except queue.Empty:
                pass
            curr_time = datetime.datetime.now()
            to_delete = self._db_connection.get_ids_to_delete()
            to_delete = [
                identifier
                for (identifier, timestamp) in to_delete
                if self._is_to_remove(curr_time=curr_time,remove_time=timestamp)
            ]
            num = self._db_connection.delete_files(ids=to_delete)
            logging.info(f'DBUpdater: removed {num} files.')
        logging.info(f'DBUpdater: Goodbye!')
