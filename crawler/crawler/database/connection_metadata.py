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


class DatabaseConnectionMetadata:

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


    def close(self) -> None:
        self.con.close()


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

    def create_metadata_decrease(self, exif_output: json) -> Dict:
        """Creates an easy to process dictionary for updating the 'metadata' table in the database
        Args:
            exif_output (json): The output from the ExifTool output.
        Returns:
            Dict: key: file type | value: Dict: key: tag value: count
        """
        # Loop over every tag for each file in the ExifTool output and add them to the dictionary
        tag_values = {}
        for single_output in exif_output:
            fileType = single_output['FileType']
            if fileType not in tag_values:
                tag_values[fileType] = {}
            for tag_value in single_output:
                test = dict(single_output)
                if tag_value in tag_values[fileType]:
                    tag_values[fileType][tag_value][0] -= 1
                else:
                    tag_values[fileType][tag_value] = [-1, '?']
                if tag_values[fileType][tag_value][1] == '?':
                    tag_values[fileType][tag_value][1] = self.output_type(test[tag_value])
        return tag_values

    @measure_time
    def delete_lost(self, crawlId: int, roots: List) -> None:
        """Scans the directories at the end of a scan, to find directories that were deleted since the last crawl

        Args:
            crawlId (int): id of the current crawl
            roots (List): list with every path/recursive pair
        """
        # Request a list of every directory skipped during the deletion process
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
                decrease = self.create_metadata_decrease([x[1] for x in entries])
                self.update_metadata({}, decrease)
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning('"Error updating file deletion"')
            curs.close()
            self.con.rollback()

    # Methods to implement in child class
    def _combine_dict(self, increases: dict, decreases: dict) -> dict:
        combined = increases
        all_type = {}
        # Subtract each value in decrease for each individual file typ
        for data_type in decreases.keys():
            if data_type in combined.keys():
                for tag_type in decreases[data_type]:
                    if tag_type in increases[data_type].keys():
                        combined[data_type][tag_type][0] = combined[data_type][tag_type][0] + decreases[data_type][tag_type][0]
                    else:
                        combined[data_type][tag_type] = decreases[data_type][tag_type]
            else:
                combined[data_type] = decreases[data_type]
        # Add the values to the 'ALL'-type
        for data_type in combined.keys():
            for tag_type in combined[data_type].keys():
                if tag_type in all_type.keys():
                    all_type[tag_type][0] = all_type[tag_type][0] + combined[data_type][tag_type][0]
                else:
                    all_type[tag_type] = combined[data_type][tag_type].copy()
        combined['ALL'] = all_type
        return combined

    @measure_time
    def update_metadata(self, increases: dict, decreases:dict) -> None:
        """Given a dictionary with key (file type) and values ((tag name, increments)) update the database
        accordingly
        Args:
            additions (dict): key (file type) and values ((tag name, increments))
        Return:
        """
        combined = self._combine_dict(increases,decreases)
        # Query to get the old values from the 'metadata' table (For each file type)
        query = "SELECT * FROM metadata WHERE file_type IN %s;"
        try:
            curs = self.con.cursor()
            query = curs.mogrify(query, (tuple([file_type for file_type in combined]),))
            curs.execute(query)
            entries = curs.fetchall()
            # Query to update the values of each entry that has a previous entry
            for entry in entries:
                file_type = [x for x in entry][0]
                updates = combined[file_type]
                query = 'UPDATE metadata SET "tags" = %s WHERE "file_type" = %s;'
                # increase the values of each entry according to the new files
                for tag in entry[1]:
                    if tag in updates.keys():
                        entry[1][tag][0] = int(entry[1][tag][0]) + int(updates[tag][0])
                        del updates[tag]
                # Tag doesn't exist yet
                for tag in updates:
                    entry[1][tag] = [int(updates[tag][0]), updates[tag][1]]
                del combined[file_type]
                query = curs.mogrify(query, (json.dumps(entry[1]), file_type))
                curs.execute(query)
            # Insert the updated values of each corresponding data type
            for file_type in combined:
                query = 'INSERT INTO "metadata" ("file_type", "tags")VALUES (%s, %s)'
                updates = (file_type, json.dumps(combined[file_type]))
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

    def decrease_dynamic(self, ids: List[int]) -> None:
        """
        Decreases the tag values in the 'metadata' table by the tag values of the files present in ids
        Args:
            ids (List[int]): file ids that metadata is gathered about
        """

        def create_metadata(metadata_delete: List[str]) -> Dict:
            # Loop over every tag in the json and sum them up in a dictionary
            metadata_dict = {}
            try:
                for entry in metadata_delete:
                    if entry[1] not in metadata_dict.keys():
                        metadata_dict[entry[1]] = {}
                    for file_result in entry[0]:
                        if file_result not in metadata_dict[entry[1]]:
                            metadata_dict[entry[1]][file_result] = [0, self.output_type(entry[0][file_result])]
                        metadata_dict[entry[1]][file_result][0] += 1
            except Exception as e:
                raise
            return metadata_dict

        # Query for requesting all the information from the previous entries (Needed to reconstruct the tags used by
        # each file)
        query = 'SELECT "metadata", "type" FROM "files" WHERE "id" IN %s'
        curs = self.con.cursor()
        query = curs.mogrify(query, (tuple(ids),))
        try:
            curs.execute(query)
            entries = curs.fetchall()
            # Create a dictionary structure for further processing
            metadata = create_metadata(entries)
            # Create a tuple with every relevant file type (For fetching the corresponding metadata)
            relevant_file_types = tuple(set([x[1] for x in entries]))
            # Query for obtaining the old data from the 'metadata' table (Must be decreased by the previous values)
            query = 'SELECT * FROM "metadata" WHERE "file_type" in %s'
            query = curs.mogrify(query, (relevant_file_types,))
            curs.execute(query)
            entries = curs.fetchall()
            # Go over every value in the old data and update it with new values
            for file_type in entries:
                to_update = file_type[1]
                merger = metadata[file_type[0]]
                for key in merger.keys():
                    to_update[key][0] = int(file_type[1][key][0]) - merger[key][0]
                query = 'UPDATE metadata SET "tags" = %s WHERE "file_type" = %s;'
                query = curs.mogrify(query, (json.dumps(to_update), file_type[0]))
                curs.execute(query)
            curs.close()
            self.con.commit()

        except:
            _logger.warning("Error decreasing the values of the metadata table!")
            # TODO Make sure the main method knows a reevaluate method should be called
            curs.close()
            self.con.rollback()
            raise
