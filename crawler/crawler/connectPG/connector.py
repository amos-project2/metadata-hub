"""Connection to database and perform query."""
from datetime import datetime
import json


import psycopg2
from typing import Tuple, List


class DatabaseConnection:

    def __init__(self, db_info: dict, powerLevel: int) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): data of local server to connect database

        Raises:
            ValueError: if given data is not correct, it cannot connect to database

        """
        try:
            # Establish connection
            self.con = psycopg2.connect(user=db_info['user'],
                                        password=db_info['password'],
                                        host=db_info['host'],
                                        port=db_info['port'],
                                        database=db_info['dbname'])

        # except:
        #     print('Error while creating the ThreadPool')
        except Exception as e:
            print(e)

        #     # database info in a string
        #     db_info_str = "dbname='{b}' user='{c}' host='{d}' password='{e}' port='{f}' \
        #                     ".format(b=db_info['dbname'], c=db_info['user'], d=db_info['host'], e=db_info['password'], f=db_info['port'])
        #     self.connection = psycopg2.connect(db_info_str)
        #     self.connection.autocommit = True
        #     self.cursor = self.connection.cursor()
        # except:
        #     pprint("Cannot connect to database")

    # TODO int too small?
    def insert_new_record(self, insert_cmd: str) -> int:
        """Insert a new record to a row in connected database.

        Args:
            insert_cmd (dict): a single INSERT query to Postgres database

        """
        curs = self.con.cursor()

        try:
            curs.execute(insert_cmd)
        except:
            raise
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        self.con.commit()
        return dbID

    def update_element(self, table: str, row: int, condition: List[str], value: str, newValue) -> int:
        """Updates the element in a row with the specified conditions.

        Args:
            table (str): table to update
            row (int): id of the row
            condition (List[str]): list of conditions that need to be fullfilled
            value (str): The value in the table that needs to be updated
            newValue: The value to write into the new row
        """
        pass

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

    def update_record(self):
        pass
