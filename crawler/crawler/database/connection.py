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
from .base import measure_time
from .base import DatabaseConnectionBase

from crawler.services.config import Config
import crawler.communication as communication

_logger = logging.getLogger(__name__)


class DatabaseConnection(DatabaseConnectionBase):


    def __init__(self, db_info: dict, measure_time: bool):
        super(DatabaseConnection, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )


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
    def delete_lost(self, crawlId: int, roots: List) -> None:
        """Delete directories that have been removed since the last crawl.

        Scans the directories at the end of a scan,
        to find directories that were deleted since the last crawl.

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
            self._set_deleted([x[0] for x in entries])
            if len(entries) > 0:
                decrease = self._create_metadata_decrease([x[1] for x in entries])
                self._update_metadata({}, decrease)
            curs.close()
            self.con.commit()
        except Exception as e:
            print(e)
            _logger.warning('"Error updating file deletion"')
            curs.close()
            self.con.rollback()


    def _set_deleted(self, file_ids: List[int]) -> None:
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


    def _create_metadata_decrease(self, exif_output: json) -> Dict:
        """Creates dictionary for updating the 'metadata' table in the database.

        Args:
            exif_output (json): The output from the ExifTool output.

        Returns:
            Dict: key: file type | value: Dict: key: tag value: count

        """
        # Loop over every tag for each file in the ExifTool output and add
        # them to the dictionary
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
                    tag_values[fileType][tag_value][1] = self._output_type(test[tag_value])
        return tag_values


    def _combine_dict(self, increases: dict, decreases: dict) -> dict:
        """Combines the dicts of de- and increasing metadata.

        Args:
            increases (dict): dictionary of increases
            decreases (dict): dictionary of decreases

        Returns:
            dict: combined dictionary

        """
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


    def _update_metadata(self, increases: dict, decreases:dict) -> None:
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


    def _output_type(self, to_check: str) -> str:
        """Determine whether the output value of a file is a digit or a string.

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

