"""Perform benchmark for timestamps."""

from crawler.connectPG.connector import DatabaseConnection
from crawler.connectPG.extract_data import extractData
from timeit import default_timer as timer



class Benchmark:
    """Class representation of a program benchmarking."""

    def __init__(self, metadata: list, con:DatabaseConnection, dbID:int) -> None:
        """Initialize the object.

        Attributes:
            metadata (list): list of dictionaries of all extracted metadata from files
            con     (class): abbreviation for class DatabaseConnection
            dbID      (int): id for current Tree Walk execution

        """
        self._metadata = metadata
        self._con = con
        self._id = dbID
   
    
    def insert_file(self) -> list:
        
        """Insert into database and measure the inserting time for each directory.

        Returns:
            list: 3 values represent for inserting time of generic, eav and total

        """       
        x = 0
        y = 0
       
        # Walk through each object/file
        for file_number in self._metadata:
            # Time-elapsed: create query and insert into 1 table_generic from 1 file        
            x_start   = timer()
            genericID = self._con.insert_new_record(extractData(file_number).extract_metadata_generic(self._id))
            x_end     = timer()
            x        += x_end - x_start
            
            # Time-elapsed: create queries and insert into 1 table_eav from 1 file
            y_start = timer()
            query   = extractData(file_number).extract_metadata_eav(self._id, genericID)
            # Apply each query to insert for each row
            for query_number in query:
                self._con.insert_new_record(query_number)
            y_end   = timer()
            y      += y_end - y_start
        
        return [x, y, x + y]
    


         


    
    
    
    