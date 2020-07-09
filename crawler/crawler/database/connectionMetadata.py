"""Database connection for the METADATA table."""

# Python imports
import os
import json
import logging
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


class DatabaseConnectionTableMetadata(DatabaseConnectionBase):

    def __init__(self, db_info: dict, measure_time: bool) -> None:
        """Initialize the connection to Postgres Database.

        Args:
            db_info (dict): connection data of the database
            measure_time (bool): measure time for database operations

        Raises:
            VallueError: when creating the connection failed

        """
        super(DatabaseConnectionTableMetadata, self).__init__(
            db_info=db_info, measure_time=measure_time
        )

    @measure_time
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

    @measure_time
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

    @measure_time
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
