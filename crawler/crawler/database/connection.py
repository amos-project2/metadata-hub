"""Connection to database and perform query."""

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
from crawler.treewalk.worker import utils
from crawler.services.config import Config
import crawler.communication as communication

_logger = logging.getLogger(__name__)


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


class DatabaseConnection:

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


    @measure_time
    def update_status(self, crawlID: int, package: List[str]):
        """Updates a row in table crawls according to the tree walk progress.

        Args:
            crawlID (int): id of the row to be updated
            package (List[str]): Directories the treewalk has handled
        """
        # Build query to get the crawl data for id crawlID
        crawls = Table('crawls')
        query = Query.from_(crawls) \
            .select('*') \
            .where(crawls.id == Parameter('%s'))
        curs = self.con.cursor()
        query1 = curs.mogrify(str(query), (crawlID,))
        try:
            curs.execute(query1)
            get = curs.fetchone()
            query = Query.update(crawls) \
                .set(crawls.update_time, Parameter('%s')) \
                .where(crawls.id == Parameter('%s'))
            query = curs.mogrify(str(query), (json.dumps(get[6]), datetime.now(), crawlID))
            curs.execute(query)
            curs.close()
            self.con.commit()
        except:
            _logger.warning('"Error updating database status"')
            curs.close()
            self.con.rollback()
        return

    @measure_time
    def insert_new_record_crawls(self, config: Config) -> int:
        """Insert a new record to the 'crawls' table. Used at the start of a crawl task.
           TODO: Add docstring
        Args:
            config (Config): Config for the crawl task.

        """
        # Prepare necessary values
        crawl_config = config.get_data(as_json=True)
        dir_path = ', '.join(
            [inputs['path'] for inputs in config.get_directories()]
        )
        author = config.get_author()
        name = config.get_name()
        starting_time = datetime.now()
        insert_values = (dir_path, author, name, 'running', crawl_config, starting_time)
        # Construct the SQL query
        crawls = Table('crawls')
        query = Query.into(crawls) \
            .columns('dir_path', 'author', 'name', 'status', 'crawl_config', 'starting_time') \
            .insert(Parameter('%s'), Parameter('%s'), Parameter('%s'), Parameter('%s'), Parameter('%s'), Parameter('%s'))
        curs = self.con.cursor()
        query = curs.mogrify(str(query), insert_values).decode('utf8')
        query = query + ' RETURNING id'
        # Make database request
        try:
            curs.execute(query)
        except:
            _logger.warning('"Error updating database"')
            curs.close()
            self.con.rollback()
            raise
        # Return result or 0 in case nothing could be fetched
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        self.con.commit()
        return dbID

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

    def close(self) -> None:
        self.con.close()

    @measure_time
    def set_crawl_state(self, tree_walk_id: int, status: str) -> None:
        """Update the status of the crawler in it's corresponding database entry.

        Args:
            tree_walk_id (int): ID of the TreeWalk execution
            status (str): status to set
        """
        # Build query to update status
        crawls = Table('crawls')
        query = Query.update(crawls) \
            .set(crawls.finished_time, Parameter('%s')) \
            .set(crawls.status, Parameter('%s')) \
            .where(crawls.id == Parameter('%s'))
        # Check if valid status was given
        if status in [communication.CRAWL_STATUS_FINISHED, communication.CRAWL_STATUS_PAUSED,
                      communication.CRAWL_STATUS_RUNNING, communication.CRAWL_STATUS_ABORTED]:
            curs = self.con.cursor()
            query = curs.mogrify(str(query), (datetime.now(), status, tree_walk_id))
        else:
            _logger.warning('"Error updating database state, state not recognized"')
            return
        # Execute query
        try:
            curs.execute(query)
            curs.close()
            self.con.commit()
        except:
            _logger.warning('"Error updating database state"')
            curs.close()
            self.con.rollback()

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
            curs.close()
            self.con.rollback()
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
        Returns:
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
    def get_ids_to_delete(self) -> List[Tuple[int, datetime]]:
        """Get the list of IDs which are marked as to be deleted.

        The result consists of a set of tuples with the corresponding ID and
        the timestamp when the file was marked as to delete.
        The calling method is responsible for checking of the time limit
        is already exceeded.

        TODO: The performance may break if there is a massive amount of files.

        Returns:
            List[Tuple(int, str)]: list of items (ID, timestamp) or None on error

        """
        sql = 'SELECT id, deleted_time FROM files WHERE deleted;'
        curs = self.con.cursor()
        try:
            curs.execute(sql)
            entries = curs.fetchall()
            curs.close()
            self.con.commit()
        except Exception as e:
            _logger.warning(f'Failed deleting files: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return entries

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

    def clear_time(self) -> None:
        """Clears the time recording for database operations."""
        self._time = 0

    def get_time(self) -> int:
        """Return the time spent for database operations in seconds.

        Returns:
            int: time in seconds

        """
        return self._time

    @measure_time
    def delete_lost(self, crawlId: int, roots: List) -> None:
        """Scans the directories at the end of a scan, to find directories that were deleted since the last crawl

        Args:
            crawlId (int): id of the current crawl
            roots (List): list with every path/recursive pair
        """
        # Request a list of every directory skipped during the deletion process
        files = Table('files')
        query = Query.from_(files) \
                .select(files.id) \
                .select(files.metadata) \
                .where(files.crawl_id != crawlId) \
                .where(files.deleted == False)
        curs = self.con.cursor()
        statements = []
        for root in roots:
            if root['recursive']:
                statements.append(curs.mogrify('"dir_path" LIKE %s', (f'{root["path"]}%',)).decode('utf8'))
            else:
                statements.append(curs.mogrify('"dir_path" = %s', (f'{root["path"]}',)).decode('utf8'))
        query = str(query) + ' AND (' + ' OR '.join(statements) + ')'
        try:
            curs.execute(query)
            entries = curs.fetchall()
            self.set_deleted([x[0] for x in entries])
            if len(entries) > 0:
                self.decrease_dynamic([x[1] for x in entries])
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning('"Error updating file deletion"')
            curs.close()
            self.con.rollback()


    def update_metadata(self, additions: dict) -> None:
        """Given a dictionary with key (file type) and values ((tag name, increments)) update the database
        accordingly
        Args:
            additions (dict): key (file type) and values ((tag name, increments))
        Return:

        """
        # Query to get the old values from the 'metadata' table (For each file type)
        query = "SELECT * FROM metadata WHERE file_type IN %s;"
        curs = self.con.cursor()
        query = curs.mogrify(query, (tuple([file_type for file_type in additions]),))
        try:
            curs.execute(query)
            entries = curs.fetchall()
            # Query to update the values of each entry that has a previous entry
            for entry in entries:
                file_type = [x for x in entry][0]
                updates = additions[file_type]
                query = 'UPDATE metadata SET "tags" = %s WHERE "file_type" = %s;'
                # increase the values of each entry according to the new files
                for tag in entry[1]:
                    if tag in updates.keys():
                        entry[1][tag][0] = int(entry[1][tag][0]) + int(updates[tag][0])
                        del updates[tag]
                # Tag doesn't exist yet
                for tag in updates:
                    entry[1][tag] = [int(updates[tag][0]), updates[tag][1]]
                del additions[file_type]
                query = curs.mogrify(query, (json.dumps(entry[1]), file_type))
                curs.execute(query)
            # Insert the updated values of each corresponding data type
            for file_type in additions:
                query = 'INSERT INTO "metadata" ("file_type", "tags")VALUES (%s, %s)'
                updates = (file_type, json.dumps(additions[file_type]))
                query = curs.mogrify(query, updates)
                curs.execute(query)
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning("Error increasing the values of the metadata table!")
            # TODO Make sure the main method knows a reevaluate method should be called
            curs.close()
            self.con.rollback()
            raise

    def output_type(self, to_check: str):
        """Determine whether the output value of a file is a digit or a string
        Args:
            to_check (str): The string variant of the value
        Returns:
            float representation if conversion is possible, string otherwise
        """
        try:
            checked = float(to_check)
            return 'dig'
        except:
            return 'str'

    def decrease_dynamic(self, jsons: json) -> None:
        """
        Decreases the tag values in the 'metadata' table by the tag values of the files present in ids
        Args:
            ids (List[int]): file ids that metadata is gathered about
        """
        test = utils.create_metadata_decrease(jsons)
        # Pass the dictionary to thread_metadata
        command = communication.Command(
            command=communication.DATABASE_THREAD_WORK,
            data=({}, test)
        )
        print(({}, test))
        communication.database_thread_metadata_input_data.put(command)
        # # Query for requesting all the information from the previous entries (Needed to reconstruct the tags used by
        # # each file)
        # query = 'SELECT "metadata", "type" FROM "files" WHERE "id" IN %s'
        # curs = self.con.cursor()
        # query = curs.mogrify(query, (tuple(ids),))
        # try:
        #     curs.execute(query)
        #     entries = curs.fetchall()
        #     # Create a dictionary structure for further processing
        #     metadata = create_metadata(entries)
        #     # Create a tuple with every relevant file type (For fetching the corresponding metadata)
        #     relevant_file_types = tuple(set([x[1] for x in entries]))
        #     # Query for obtaining the old data from the 'metadata' table (Must be decreased by the previous values)
        #     query = 'SELECT * FROM "metadata" WHERE "file_type" in %s'
        #     query = curs.mogrify(query, (relevant_file_types,))
        #     curs.execute(query)
        #     entries = curs.fetchall()
        #     print(entries)
        #     # Go over every value in the old data and update it with new values
        #     for file_type in entries:
        #         to_update = file_type[1]
        #         merger = metadata[file_type[0]]
        #         for key in merger.keys():
        #             to_update[key][0] = int(file_type[1][key][0]) - merger[key][0]
        #         query = 'UPDATE metadata SET "tags" = %s WHERE "file_type" = %s;'
        #         print(query)
        #         query = curs.mogrify(query, (json.dumps(to_update), file_type[0]))
        #         curs.execute(query)
        #     curs.close()
        #     self.con.commit()
        #
        # except:
        #     _logger.warning("Error decreasing the values of the metadata table!")
        #     # TODO Make sure the main method knows a reevaluate method should be called
        #     curs.close()
        #     self.con.rollback()
        #     raise
