"""Connection to database and perform query."""


# Python imports
import json
import logging
import datetime
from typing import List


# 3rd party modules
import psycopg2
import psycopg2.pool


# Local imports
from crawler.services.config import Config


_logger = logging.getLogger(__name__)


class DatabaseConnection:


    def __init__(self, db_info: dict, num_connections: int = 1) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): connection data of the database
            num_connections (int): number of connections of the pool

        Raises:
            VallueError: when creating the connection failed

        """
        try:
            self._connection_pool = psycopg2.pool.SimpleConnectionPool(
                1,
                num_connections,
                user=db_info['user'],
                password=db_info['password'],
                host=db_info['host'],
                port=db_info['port'],
                database=db_info['dbname']
            )
        except Exception as err:
            raise ValueError(f'Database initialization error: {err}')


    def insert_new_record(self, insert_cmd: str) -> int:
        """Execute a SQL command.

        Args:
            cmd (str): a single command to execute

        Returns:
            int: 0 on error,

        """
        con = self._connection_pool.getconn()
        curs = con.cursor()
        try:
            curs.execute(insert_cmd)
        except Exception as err:
            _logger.error(f'Failed inserting new record. ') # FIXME Add {err} agina
            self._connection_pool.putconn(con)
            return 0
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        con.commit()
        self._connection_pool.putconn(con)
        return dbID


    def insert_crawl(self, config: Config, analyzed_dirs: List[str] = []) -> int:
        crawl_config = json.dumps(config.get_data())
        dir_path = ', '.join(
            [inputs['path'] for inputs in config.get_paths_inputs()]
        )
        analyzed_dirs = json.dumps(analyzed_dirs)
        starting_time = datetime.datetime.now()
        cmd = (
            f'INSERT INTO crawls '
            f'(dir_path, name, status, crawl_config, analyzed_dirs, starting_time) '
            f'VALUES(\'{dir_path}\', \'---\', \'Running\', '
            f'\'{crawl_config}\', \'{analyzed_dirs}\', \'{starting_time}\')'
            f'RETURNING id'
        )
        con = self._connection_pool.getconn()
        curs = con.cursor()
        try:
            curs.execute(cmd)
        except Exception as err:
            self._connection_pool.putconn(con)
            return 0
        try:
            db_id = curs.fetchone()[0]
        except:
            db_id = 0
        curs.close()
        con.commit()
        self._connection_pool.putconn(con)
        return db_id


    def close(self) -> None:
        self._connection_pool.closeall()


    def update_analyzed_dirs(
            self,
            tree_walk_id: int,
            analyzed_dirs: List[str]
    ) -> None:
        """Update the analyzed directories for given crawl.

        # TODO TREEWALK - Implement me :)

        Args:
            tree_walk_id (int): ID of the TreeWalk execution
            analyzed_dirs (List[str]): list of processed directories
        """
        pass


    def set_crawl_state(
            self,
            tree_walk_id: int,
            status: str
    ) -> None:
        """Update the status of the crawl.

        # TODO TREEWALK - Implement me :)

        Args:
            tree_walk_id (int): ID of the TreeWalk execution
            status (str): status to set

        """
        pass
