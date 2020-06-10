"""Connection to database and perform query."""

# Python imports
import json
import logging
from datetime import datetime
from typing import List
from typing import List, Tuple

# 3rd party modules
import psycopg2

# Local imports
from crawler.services.config import Config
import crawler.communication as communication

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

    def update_status(self, crawlID: int, package: List[str]):
        """Updates a row in table crawls according to the tree walk progress.

        Args:
            crawlID (int): id of the row to be updated
            package (List[str]): Directories the treewalk has handled
        """
        curs = self.con.cursor()
        get_current = ('SELECT * '
                       'FROM crawls '
                       f'WHERE id = {crawlID}')
        try:
            curs.execute(get_current)
            get = curs.fetchone()
            get[5]["analyzed directories"].extend(package)
            update_dirs = ('UPDATE crawls '
                           f'SET analyzed_dirs = \'{json.dumps(get[5])}\', update_time = \'{datetime.now()}\''
                           f'WHERE id = {crawlID}')
            curs.execute(update_dirs)
            curs.close()
            self.con.commit()
        except:
            _logger.warning('"Error updating database status"')
            curs.close()
            self.con.rollback()
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
            _logger.warning('"Error inserting data into database"')
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
            f'VALUES(\'{dir_path}\', \'---\', \'running\', '
            f'\'{crawl_config}\', \'{analyzed_dirs}\', \'{starting_time}\')'
            f'RETURNING id'
        )
        curs = self.con.cursor()
        try:
            curs.execute(cmd)
        except:
            _logger.warning('"Error updating database"')
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

    def close(self) -> None:
        self.con.close()

    def set_crawl_state(
        self,
        tree_walk_id: int,
        status: str
    ) -> None:
        """Update the status of the crawl.

        Args:
            tree_walk_id (int): ID of the TreeWalk execution
            status (str): status to set

        """

        curs = self.con.cursor()
        get_current = ('SELECT * '
                       'FROM crawls '
                       f'WHERE id = {tree_walk_id}')
        try:
            curs.execute(get_current)
            get = curs.fetchone()

            if status == communication.CRAWL_STATUS_FINISHED:
                update_status = ('UPDATE crawls '
                                 f'SET finished_time = \'{datetime.now()}\', status = \'{communication.CRAWL_STATUS_FINISHED}\''
                                 f'WHERE id = {tree_walk_id}')
            elif status == communication.CRAWL_STATUS_PAUSED:
                update_status = ('UPDATE crawls '
                                 f'SET status = \'{communication.CRAWL_STATUS_PAUSED}\''
                                 f'WHERE id = {tree_walk_id}')
            elif status == communication.CRAWL_STATUS_RUNNING:
                update_status = ('UPDATE crawls '
                                 f'SET status = \'{communication.CRAWL_STATUS_RUNNING}\''
                                 f'WHERE id = {tree_walk_id}')
            elif status == communication.CRAWL_STATUS_ABORTED:
                update_status = ('UPDATE crawls '
                                 f'SET status = \'{communication.CRAWL_STATUS_ABORTED}\''
                                 f'WHERE id = {tree_walk_id}')
            else:
                _logger.warning('"Error updating database state, state not recognized"')
                return

            curs.execute(update_status)
            curs.close()
            self.con.commit()
        except:
            _logger.warning('"Error updating database state"')
            curs.close()
            self.con.rollback()

    def check_hash(self, fileHash: str, path: str, crawl_id: int, name: str) -> int:
        """checks the database for a given file hash. Then checks if the directory path is the same.

        Args:
            fileHash (str): hash of the file to be checked
            path (str): directory path the file should be in
            crawl_id (int): current crawl_id
        Returns:
            int: file id that is supposed to be deleted
        """
        curs = self.con.cursor()
        get_hash = ('(SELECT id, crawl_id, dir_path, name '
                    'FROM files '
                    f'WHERE file_hash = \'{fileHash}\')'
                    )
        try:
            curs.execute(get_hash)
            get = curs.fetchall()
        except Exception as e:
            print(e)
        curs.close()
        self.con.commit()

        # Find the most recent entry (All others should already be set to deleted) and return file id
        if len(get) < 2:
            return 0

        max_id = 0
        tmp = (0, 0, '')
        for item in get:
            if item[2] == path and item[3] == name:
                if max_id < item[1] and item[1] != crawl_id:
                    max_id = item[1]
                    tmp = item
        return tmp[0]

    def set_deleted(self, files: List[int]):
        condition = 'id = ' + ' OR id = '.join(str(x) for x in files)
        set_delete = ('UPDATE files '
                      f'SET deleted = True, deleted_time = \'{datetime.now()}\' '
                      f'WHERE {condition}')
        curs = self.con.cursor()
        try:
            curs.execute(set_delete)
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning('"Error updating file deletion"')
            curs.close()
            self.con.rollback()
