"""Connection to database and perform query."""

import psycopg2
from pprint import pprint

class DatabaseConnection:
    
    
    def __init__(self, db_info: dict) -> None:
        """Initialize the connection to Postgre Database.

        Args:
            db_info (dict): data of local server to connect database

        Raises:
            ValueError: if given data is not correct, it cannot connect to database
        
        """                    
        try:
            self.connection = psycopg2.connect(" ".join(db_info))       
            self.connection.autocommit = True
            self.cursor = self.connection.cursor()
        except:
            pprint("Cannot connect to database")

        
        
    def insert_new_record(self, insert_cmd: str) -> None:      
        """Insert a new record to a row in connected database.

        Args:
            insert_cmd (dict): a single INSERT query to Postgre database 

        """
        self.cursor.execute(insert_cmd)
    
            
    def update_record(self):
        pass

    
    
    