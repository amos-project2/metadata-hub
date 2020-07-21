"""Connection to database for file insertion related tasks"""

# Python imports
import json
import logging
import os
from builtins import print
from datetime import datetime
from typing import List, Tuple, Dict

# 3rd party modules
import psycopg2
from pypika import Query, Table, Field, Parameter

# Local imports
from .base import measure_time
from .base import DatabaseConnectionBase

from crawler.services.config import Config
import crawler.communication as communication

_logger = logging.getLogger(__name__)


class DatabaseConnectionFiles(DatabaseConnectionBase):


    def __init__(self, db_info: dict, measure_time: bool):
        super(DatabaseConnectionFiles, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )


    @measure_time
    def insert_new_record_files(self, insert_values: List[Tuple[str]]) -> None:
        """Insert a new record to the 'files' table based on the ExifTool output.

        Args:
            insert_values (List[Tuple[str]): A list of lists. Contains the values for each row to be inserted.

        """
        # Construct the SQL query for inserting the new files into the 'files' table
        query = 'INSERT INTO "files" ("crawl_id","dir_path","name","type","size","metadata","creation_time", ' \
                '"access_time","modification_time","deleted","deleted_time","file_hash", "in_metadata") VALUES '
        curs = self.con.cursor()
        for insert in insert_values:
            query += curs.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s),", insert).decode('utf8')
        # Execute the constructed query (Rollback in case of error)
        try:
            curs.execute(query[:-1])
        except:
            _logger.warning('"Error inserting data into database"')
            curs.close()
            self.con.rollback()
            raise
        curs.close()
        self.con.commit()
        return


    @measure_time
    def check_directory(self, path: str, current_hashes: List[str]) -> List[int]:
        """checks the database for a given directory. Returns all the most recent ids.

        Args:
            path (str): directory path to be checked
            current_hashes (List[str]): list of all hashes from current files
        Returns:
            List(int): file ids that are supposed to be deleted
        """
        files = Table('files')
        query = Query.from_(files) \
            .select('id', 'crawl_id', 'dir_path', 'name', 'file_hash', 'metadata') \
            .where(files.dir_path == Parameter('%s'))
        curs = self.con.cursor()
        query = curs.mogrify(str(query), (path,))
        try:
            curs.execute(query)
            get = curs.fetchall()
        except:
            return []
        curs.close()
        self.con.commit()

        # Find the second highest crawl id (remove max first as it is the current crawl)
        id_set = set([x[1] for x in get])
        id_set.remove(max(id_set))
        if len(id_set) == 0:
            return []
        recent_crawl = max(id_set)
        # Make list with every file_id in that directory/crawl
        file_ids = [(x[0],x[-1]) for x in get if x[1] == recent_crawl and x[-2] in current_hashes]
        return file_ids


    @measure_time
    def set_deleted(self, file_ids: List[int]) -> None:
        """Set every file in file_ids deleted and deleted_time value.

        Args:
            file_ids (List[int): List of file ids to be deleted

        """
        if len(file_ids) < 1:
            return
        files = Table('files')
        query = Query.update(files) \
            .set(files.deleted, 'True') \
            .set(files.deleted_time, datetime.now()) \
            .where(files.id.isin(Parameter('%s')))
        curs = self.con.cursor()
        query = curs.mogrify(str(query), (tuple(file_ids),))
        try:
            curs.execute(query)
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning('"Error updating file deletion"')
            curs.close()
            self.con.rollback()


    @measure_time
    def delete_files(self, ids: List[int]) -> int:
        """Remove the given IDs from the files table.

        Args:
            ids (List[int]): list of IDs

        Returns:
            int: number of deleted rows or None on error

        """
        if not ids:
            return 0
        curs = self.con.cursor()
        sql = curs.mogrify('DELETE FROM files WHERE id IN %s;', (tuple(ids),))
        try:
            curs.execute(sql, ids)
            num = curs.rowcount
            curs.close()
            self.con.commit()
        except Exception as e:
            _logger.warning(f'Failed deleting files: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return num
