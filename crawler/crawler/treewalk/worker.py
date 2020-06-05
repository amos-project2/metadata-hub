"""Implementation of the worker process.

The worker process is implemented as a process instead of a thread because
of the Python GIL that prevents threads from parallel execution.
Running the exiftool and hashing files is a CPU-bounded task, thus processes
are required for speeding up the execution time.
"""


# Python imports
import logging
import subprocess
import json
import hashlib
from typing import List
from queue import Empty
from time import sleep # FIXME REMOVE
from random import random # FIXME REMOVE
from multiprocessing import Process, Queue


# 3rd party imports
from psycopg2.extensions import connection


# Local imports
from crawler.services.config import Config
from crawler.connectPG.connector import DatabaseConnection

from crawler.services.tracing import Tracer

_logger = logging.getLogger(__name__)


class Worker(Process):

    COMMAND_STOP = 'stop'
    COMMAND_PAUSE = 'pause'
    COMMAND_UNPAUSE = 'unpause'

    def __init__(
            self,
            work_packages: Queue,
            command_queue: Queue,
            config: Config,
            connectionInfo: dict,
            # db_connection: DatabaseConnection,
            tree_walk_id: int,
            TRACER: Tracer
    ):
        super(Worker, self).__init__()
        self.work_packages = work_packages
        self.command_queue = command_queue
        self._config = config
        self.connectionInfo = connectionInfo
        # self._db_connection = db_connection
        self._tree_walk_id = tree_walk_id
        self.TRACER = TRACER
        self.dbConnectionPool = DatabaseConnection(self.connectionInfo, 1)



    def run(self) -> None:
        """Run the worker process.

        The worker process consistently checks the command queue in order to
        receive new commands. Both queues are pulled non-blocking.
        Commands are dispatched to the run_command method.
        Work packages are processed as long as the queue is not empty.
        In this case, all work is done and the process can finish.

        """
        _logger.info(f'Starting process with PID {self.pid}.')
        while True:
            try:
                command = self.command_queue.get(False)
                if self.run_command(command):
                    break
            except Empty:
                pass
            try:
                package = self.work_packages.get(False)
            except Empty:
                break
            self._do_work(package)
        _logger.info(f'Terminating process with PID {self.pid}.')


    def run_command(self, command: str) -> bool:
        """Helper method for running a command retreived by the command queue.

        Args:
            command (str): command to execute

        Returns:
            bool: False for continuing, True for stopping

        """
        _logger.debug(f'Got command {command} for process with PID {self.pid}.')
        if command == Worker.COMMAND_UNPAUSE:
            return False
        if command == Worker.COMMAND_PAUSE:
            next_command = self.command_queue.get()
            return self.run_command(next_command)
        if command == Worker.COMMAND_STOP:
            self._clean_up()
            return True
        # Unknown command was passed. Log this and exit worker process.
        logging.critical(
            f'Retrieved invalid command {command}. Terminating {self.pid}.'
        )
        self._clean_up()
        return True


    def createInsert(self, exif: json, value:str) -> str:
        """Helper method for collecting all the values from the output of a file.

        Args:
            exif (json): the exif output
            value (str): the fist part of the string

        Returns:
            str: string with the extracted values

        """
        # Make validity check (if any of these are missing, the element can't be inserted into the database)
        for element in ['Directory', 'FileName', 'FileType', 'FileSize']:
            if element not in exif:
                return '0'


        # Extract the metadata for the 'files' table
        for i in ['Directory', 'FileName', 'FileType']:
            try:
                value += f"'{exif[i]}', "
            except:
                value += 'NULL, '
        for i in ['FileSize']:
            try:
                val = self.getSize(exif[i])
                value += f"'{val}', "
            except:
                value += 'NULL, '
        for i in ['FileAccessDate', 'FileModifyDate', 'FileCreationDate']:
            try:
                valueTmp = f"'{exif[i]}"
                value += f"'{valueTmp[1:12].replace(':', '-') + valueTmp[13:]}', "
            except:
                value += "'-infinity', "
        return value


    def getSize(self, size:str) -> str:
        """Convert the size into bytes

        Args:
            size (str): the exif output for size

        Returns:
            str: string with the value in bytes

        """

        unit = size.split(' ')[1]
        multipl = 1
        if unit[0] == 'k':
            multipl = 1000
        elif unit[0] == 'm':
            multipl = 1000000
        elif unit[0] == 'g':
            multipl = 1000000000
        elif unit[0] == 't':
            multipl = 1000000000000
        return f"{int(size.split(' ')[0]) * multipl}"


    def _do_work(self, package: List[str]) -> None:
        """Process the work package.

        Args:
            package (List[str]): list of directories to process.

        """
        pathEx = self._config.get_exiftool_executable()
        _logger.debug(f'Doing work ({self.pid}).')

        # Use the exiftool and create a json from the output for easier processing
        try:
            process = subprocess.Popen([f'{pathEx}', '-json', *package], stdout=subprocess.PIPE)
            metadata = json.load(process.stdout)
        except:
            print(f'Error executing the exiftool in process {self.pid}')
            return

        # create the default insert for the database
        insertin = ('INSERT INTO files '
                    '(crawl_id, dir_path, name, type, size, creation_time, access_time, modification_time, metadata'
                    ', file_hash) '
                    'VALUES ')
        # create the value string with the tree walk id already inserted
        value = (f'\'{self._tree_walk_id}\', ')
        inserts = []
        for result in metadata:
            # get the exif output for file x
            values = self.createInsert(result, value)
            # TODO remove constraints in the database
            # Check if result is valid
            if values == '0':
                #TODO Remove debuging print
                print('Can\'t insert element into database because a core value is missing:')
                print(result)
                continue
            # compute the hash256 and add it to the values string
            with open(f"{result['Directory']}/{result['FileName']}", "rb") as file:
                bytes = file.read()
                hash256 = hashlib.sha256(bytes).hexdigest()

            # add the value string to the rest for insert batching
            inserts.append(f'({values}\'{json.dumps(result)}\', \'{hash256}\')')

        # insert into the database
        try:
            self.dbConnectionPool.insert_new_record(insertin + ','.join(inserts))
            # TODO Add the tracing into table crawls here
        except Exception as e:
            # TODO Remove the print below after testing
            print("There was an error inserting the batched results")
            print(e)

            # Try to insert each command indiviually and print out the problematic result
            for insert in inserts:
                try:
                    self.dbConnectionPool.insert_new_record(insertin + insert)
                except Exception as e:
                    print('Unable to insert command:')
                    print(e)




    def _clean_up(self) -> None:
        """Clean up method for cleaning up all used resources.

        The command queue is already empty.

        """
        _logger.debug(f'Cleaning up process with PID {self.pid}')
        self.dbConnectionPool.dbConnectionPool.closeall()
        # self._db_connection.close()

        # Empty the work package list. Otherwise BrokenPipe errors will appear
        # because the queue still contains items.
        while not self.work_packages.empty():
            self.work_packages.get(False)
