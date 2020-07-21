"""Connection to database and perform query."""

# Python imports
import json
import logging
import os
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


class DatabaseConnectionMetadata(DatabaseConnectionBase):

    def __init__(self, db_info: dict, measure_time: bool):
        super(DatabaseConnectionMetadata, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )


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


    @measure_time
    def update_metadata(self, increases: dict, decreases:dict) -> None:
        """Updates the metadata table.

        Given a dictionary with key (file type) and values
        ((tag name, increments)) update the database accordingly.

        Args:
            additions (dict): key (file type) and values ((tag name, increments))

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
            logging.warning("Error increasing the values of the metadata table!")
            # TODO Make sure the main method knows a reevaluate method should be called
            curs.close()
            self.con.rollback()
            raise
