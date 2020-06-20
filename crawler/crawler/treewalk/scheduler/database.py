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
from crawler.database import DatabaseConnectionBase
from . import task as task_module
from . import utils
import crawler.services.environment as environment


_logger = logging.getLogger(__name__)


class SchedulerDatabaseConnection(DatabaseConnectionBase):

    def __init__(self, db_info: dict, measure_time: bool):
        super(SchedulerDatabaseConnection, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )

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
            _logger.warning(f'Failed getting identifiers: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return [identifier[0] for identifier in identifiers]

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
            _logger.warning(f'Failed inserting config in schedule: {str(e)}')
            cursor.close()
            self.con.rollback()
            return False

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
            _logger.warning(f'Failed getting schedule from database: {str(e)}')
            cursor.close()
            self.con.rollback()
            return None
        return [
            task_module.Task(*entry).to_json() if as_json
            else task_module.Task(*entry)
            for entry in schedule
        ]

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
            _logger.warning(f'Failed getting pending from database: {str(e)}')
            cursor.close()
            self.con.rollback()
            return None
        return utils.get_next_task(
            tasks=[task_module.Task(*entry) for entry in pending]
        )

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
            _logger.warning(f'Failed updating config in schedule: {str(e)}')
            cursor.close()
            self.con.rollback()
            return False

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
            _logger.warning(f'Failed removing config from schedule: {str(e)}')
            cursor.close()
            self.con.rollback()
            return False



if __name__ == '__main__':
    try:
        environment.init()
    except environment.InvalidEnvironmentException as err:
        print(f'{str(err)} Aborted.')
        exit(1)
    connection_data = dict(
        user=environment.env.DATABASE_USER,
        password=environment.env.DATABASE_PASSWORD,
        host=environment.env.DATABASE_HOST,
        port=environment.env.DATABASE_PORT,
        dbname=environment.env.DATABASE_NAME
    )
    from crawler.services.config import ConfigParser
    filename = '/home/benjamin/config.json'
    parser = ConfigParser(filename)
    config = parser.parse()
    connection_data = dict(
        user=environment.env.DATABASE_USER,
        password=environment.env.DATABASE_PASSWORD,
        host=environment.env.DATABASE_HOST,
        port=environment.env.DATABASE_PORT,
        dbname=environment.env.DATABASE_NAME
    )
    db = SchedulerDatabaseConnection(db_info=connection_data, measure_time=False)
    # print(db.get_identifiers())
    # print(db.insert(config=config))
    # print(db.remove("603bbbefeea4b18f750a9218b461d9924e0beadde518aa09959128d068bcdd92"))
    # tasks = db.get_schedule(as_json=False)
    # for task in tasks:
    #     task.pending = True
    #     task.timestamp_next = datetime.datetime.now()
    # print(db.update_schedule(tasks=tasks))
    print(db.get_next_task().identifier)
