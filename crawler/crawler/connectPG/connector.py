"""Connection to database and perform query."""

import psycopg2
from psycopg2 import pool
from pprint import pprint

class DatabaseConnection:


    def __init__(self, db_info: dict, powerLevel:int) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): data of local server to connect database

        Raises:
            ValueError: if given data is not correct, it cannot connect to database

        """
        try:
            # Establish connection pool
            self.dbConnectionPool = psycopg2.pool.SimpleConnectionPool(1, powerLevel,
                                                                user=db_info['user'],
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


    #TODO int too small?
    def insert_new_record(self, insert_cmd: str) -> int:
        """Insert a new record to a row in connected database.

        Args:
            insert_cmd (dict): a single INSERT query to Postgres database

        """
        con = self.dbConnectionPool.getconn()
        curs = con.cursor()
        try:
            curs.execute(insert_cmd)
        except Exception as e:
            print(e)
            self.dbConnectionPool.putconn(con)
            print('Error execution the insert command')
            print(insert_cmd)
            return 0
        try:
            dbID = curs.fetchone()[0]
        except:
            dbID = 0
        curs.close()
        con.commit()
        self.dbConnectionPool.putconn(con)
        return dbID

    def update_record(self):
        pass



