"""Connection to database and perform query."""


# Python imports
import json
import logging
from datetime import datetime
from typing import List


# 3rd party modules
import psycopg2


# Local imports
from crawler.services.config import Config


_logger = logging.getLogger(__name__)


class DatabaseConnection:


    def __init__(self, db_info: dict) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): connection data of the database

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


    def update_status(self, crawlID:int, package:List[str]):
        """Updates a row in table crawls according to the tree walk progress.

        Args:
            crawlID (int): id of the row to be updated
            package (List[str]): Directories the treewalk has handled
        """
        curs = self.con.cursor()
        get_current = ('SELECT * '
                      'FROM crawls '
                      f'WHERE id = {crawlID}')

        curs.execute(get_current)
        get = curs.fetchone()
        get[5]["analyzed directories"].extend(package)
        update_dirs = ('UPDATE crawls '
                       f'SET analyzed_dirs = \'{json.dumps(get[5])}\', update_time = \'{datetime.now()}\''
                       f'WHERE id = {crawlID}')
        curs.execute(update_dirs)
        curs.close()
        self.con.commit()

        return


    def insert_new_record(self, insert_cmd: str) -> int:
        """Insert a new record to a row in connected database.

        Args:
            insert_cmd (dict): a single INSERT query to Postgres database

        """
        curs = self.con.cursor()
        try:
            curs.execute(insert_cmd)
        except:
            curs.close()
            self.con.rollback()
            raise
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        self.con.commit()
        return dbID


    def insert_crawl(self, config: Config) -> int:
        """TODO: Add docstring

        Args:
            config (Config): [description]
            analyzed_dirs (List[str], optional): [description]. Defaults to [].

        Returns:
            int: [description]

        """
        crawl_config = json.dumps(config.get_data())
        dir_path = ', '.join(
            [inputs['path'] for inputs in config.get_paths_inputs()]
        )
        analyzed_dirs = json.dumps({"analyzed directories": []})
        starting_time = datetime.now()
        cmd = (
            f'INSERT INTO crawls '
            f'(dir_path, name, status, crawl_config, analyzed_dirs, starting_time) '
            f'VALUES(\'{dir_path}\', \'---\', \'Running\', '
            f'\'{crawl_config}\', \'{analyzed_dirs}\', \'{starting_time}\')'
            f'RETURNING id'
        )
        curs = self.con.cursor()
        try:
            curs.execute(cmd)
        except:
            raise
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        self.con.commit()
        return dbID


    def close(self) -> None:
        self.con.close()


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
