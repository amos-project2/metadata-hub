"""Database connection for the scheduler.

The scheduler only works with the 'schedule' table in the database, so it
can use its own implementation of the database connection.
"""


# Python imports
import datetime
import logging
from typing import List, Union, Tuple


# Local imports
from crawler.services.config import Config
from crawler.services.intervals import TimeInterval

from crawler.database import measure_time
from crawler.database import DatabaseConnectionBase

from . import task as task_module
from . import utils
import crawler.services.environment as environment


class SchedulerDatabaseConnection(DatabaseConnectionBase):

    def __init__(self, db_info: dict, measure_time: bool):
        super(SchedulerDatabaseConnection, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )
        self._intervals = []

    @measure_time
    def get_identifiers(self) -> List[str]:
        """Get the list of present identifiers in the schedule table.

        Returns:
            List[str]: list of identifiers

        """
        SQL = 'SELECT id FROM schedule;'
        curs = self.con.cursor()
        try:
            curs.execute(SQL)
            identifiers = curs.fetchall()
            curs.close()
            self.con.commit()
        except Exception as e:
            logging.warning(f'TWSchedulerDB: failed getting identifiers: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return [identifier[0] for identifier in identifiers]

    @measure_time
    def insert(self, config: Config) -> bool:
        """Insert a new task in the schedule table.

        Args:
            config (Config): configuration to insert

        Returns:
            bool: True on success, False on failure

        """
        data = (
            config.get_identifier(), # id
            config.get_data(as_json=True), # config
            config.get_start(), # timestamp
            config.get_force_update(), # force
            False, # pending
            config.get_interval() # interval
        )
        SQL = 'INSERT INTO schedule VALUES %s RETURNING id;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL, (data, ))
        try:
            cursor.execute(query)
            status = cursor.rowcount == 1
            cursor.close()
            self.con.commit()
            return status
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed inserting config in schedule: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return False

    @measure_time
    def update_schedule(self, tasks: List[task_module.Task]) -> bool:
        """Update the schedule with given tasks.

        This method assumes that for each task the flag update_database
        is set, so that these are really entries that should be updated.

        Args:
            tasks (List[task_module.Task]): tasks to update

        Returns:
            bool: True if all updates succeed, False otherwise

        """
        result = [
            self.update(
                identifier=task.identifier,
                timestamp_next=task.timestamp_next,
                pending=task.pending
            )
            for task in tasks
        ]
        return all(result)

    @measure_time
    def get_schedule(self, as_json: bool) -> Union[List[str], List[task_module.Task]]:
        """Return the schedule from the database.

        Either return it as a json formatted structure (used in the API) or
        as a list of editable task objects (for the scheduler thread).

        Returns:
            Union[List[str], List[task_module.Task]]: result
        """
        SQL = 'SELECT * FROM schedule;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL)
        try:
            cursor.execute(query)
            schedule = cursor.fetchall()
            cursor.close()
            self.con.commit()
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed getting schedule from database: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return None
        return [
            task_module.Task(*entry).to_json() if as_json
            else task_module.Task(*entry)
            for entry in schedule
        ]

    @measure_time
    def get_next_task(self) -> task_module.Task:
        """Return the next task to be executed.

        Returns the task that is executed to be next or None if there is no
        task to be executed.

        Returns:
            task_module.Task: next executable task, None if none is present

        """
        SQL = 'SELECT * FROM schedule WHERE pending;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL)
        try:
            cursor.execute(query)
            pending = cursor.fetchall()
            cursor.close()
            self.con.commit()
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed getting pending from database: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return None
        return utils.get_next_task(
            tasks=[task_module.Task(*entry) for entry in pending]
        )

    @measure_time
    def update(self, identifier: str, timestamp_next: str, pending: bool) -> bool:
        """Update the given task with the new values.

        Args:
            identifier (str): identifier of the task/config
            timestamp_next (str): next timestamp of execution
            pending (bool): if task is pending or not

        Returns:
            bool: True if it succeeds, False otherwise

        """
        SQL = 'UPDATE schedule SET timestamp = %s, pending = %s WHERE id = %s;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL, (timestamp_next, pending, identifier, ))
        try:
            cursor.execute(query)
            status = cursor.rowcount == 1
            cursor.close()
            self.con.commit()
            return status
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed updating config in schedule: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return False

    @measure_time
    def remove(self, identifier: str) -> bool:
        """Remove the config with given identifier from the schedule.

        Args:
            identifier (str): identifier of the config

        Returns:
            bool: True on success, False on failure

        """
        SQL = 'DELETE FROM schedule WHERE id = %s;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL, (identifier, ))
        try:
            cursor.execute(query)
            status = cursor.rowcount == 1
            cursor.close()
            self.con.commit()
            return status
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed removing config from schedule: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return False

    @measure_time
    def remove_interval(
            self,
            identifier: str,
            intervals: List[TimeInterval]
    ) -> bool:
        """Remove the interval with given identifier from the database.

        It automatically removes the time interval from the in-memory list
        as well on success.

        Args:
            identifier (str): identifier of the interval
            intervals (List[TimeInterval]): in memory list of time intervals

        Returns:
            bool: True on success, False on failure

        """
        SQL = 'DELETE FROM time_intervals WHERE id = %s;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL, (identifier, ))
        try:
            cursor.execute(query)
            status = cursor.rowcount == 1
            cursor.close()
            self.con.commit()
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed removing config from schedule: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return False
        if status:
            for index, interval in enumerate(intervals):
                if interval._identifier == identifier:
                    intervals.pop(index)
                    break
        return status

    @measure_time
    def add_interval(
            self,
            interval: TimeInterval,
            intervals: List[TimeInterval]
    ) -> bool:
        """Add the interval to the database.

        The in-memory list of intervals is passed as well, so the interval
        is automatically appended if the insertion was successful.

        Args:
            identifier (str): new interval object
            intervals (List[TimeInterval]): in memory list of time intervals

        Returns:
            bool: True on success, False on failure

        """
        data = (
            interval._identifier, # identifier
            interval._start_str, # start_str
            interval._end_str, # end_str
            interval._cpu_level # cpu_level
        )
        SQL = 'INSERT INTO time_intervals VALUES %s RETURNING id;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL, (data, ))
        try:
            cursor.execute(query)
            status = cursor.rowcount == 1
            cursor.close()
            self.con.commit()
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed inserting interval in database: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return False
        if status:
            intervals.append(interval)
        return status

    @measure_time
    def get_intervals(self, as_json: bool) -> Union[List[str], List[TimeInterval]]:
        """Return all present intervals.


        Returns:
            Union[List[str], List[TimeInterval]]: all intervals

        """
        SQL = 'SELECT * FROM time_intervals;'
        cursor = self.con.cursor()
        query = cursor.mogrify(SQL)
        try:
            cursor.execute(query)
            intervals = cursor.fetchall()
            cursor.close()
            self.con.commit()
        except Exception as e:
            logging.warning(
                f'TWSchedulerDB: failed getting time intervals from database: {str(e)}'
            )
            cursor.close()
            self.con.rollback()
            return None
        return [
            TimeInterval(start_str, end_str, cpu_level, identifier).to_json()
            if as_json
            else TimeInterval(start_str, end_str, cpu_level, identifier)
            for identifier, start_str, end_str, cpu_level in intervals
        ]
