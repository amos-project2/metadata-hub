

# Python imports
import psycopg2
from datetime import datetime


def measure_time(func):
    """Decorator for time measurement of DatabaseConnection objects.

    This decorator is used for roughly estimate the time spent for database
    operations. It can wrap arbitrary methods of DatabaseConnection objects.

    Args:
        func (function): function to wrap

    """

    def decorator(self, *args, **kwargs):
        if self._measure_time:
            start = datetime.now()
            result = func(self, *args, **kwargs)
            end = datetime.now()
            self._time += (end - start).total_seconds()
        else:
            result = func(self, *args, **kwargs)
        return result

    return decorator


class DatabaseConnectionBase:

    def __init__(self, db_info: dict, measure_time: bool) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): connection data of the database
            measure_time (bool): measure time for database operations

        Raises:
            VallueError: when creating the connection failed

        """
        try:
            self.con = psycopg2.connect(
                user=db_info['user'],
                password=db_info['password'],
                host=db_info['host'],
                port=db_info['port'],
                database=db_info['dbname']
            )
        except Exception as err:
            raise ValueError(f'Database initialization error: {err}')
        self._time = 0
        self._measure_time = measure_time


