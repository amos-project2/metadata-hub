"""Implementation of the worker process.

The worker process is implemented as a process instead of a thread because
of the Python GIL that prevents threads from parallel execution.
Running the exiftool and hashing files is a CPU-bounded task, thus processes
are required for speeding up the execution time.
"""


# Python imports
import json
import queue
import hashlib
import logging
import subprocess
import time # FIXME
import random # FIXME
import multiprocessing
from typing import List, Any


# 3rd party imports
from psycopg2.extensions import connection


# Local imports
from crawler.services.config import Config
import crawler.database as database
from crawler.services.tracing import Tracer
import crawler.communication as communication


_logger = logging.getLogger(__name__)


class Worker(multiprocessing.Process):


    def __init__(
            self,
            queue: multiprocessing.Queue,
            config: Config,
            connection_data: dict,
            tree_walk_id: int,
            lock: multiprocessing.Lock,
            counter: multiprocessing.Value,
            finished: multiprocessing.Event,
            num_workers: int
    ):
        super(Worker, self).__init__()
        self._queue = queue
        self._config = config
        self._tree_walk_id = tree_walk_id
        self._lock = lock
        self._counter = counter
        self._db_connection = database.DatabaseConnection(connection_data)
        self._exiftool = self._config.get_exiftool_executable()
        self._finished = finished
        self._num_workers = num_workers


    def run(self) -> None:
        """Run the worker process.

        TODO: Add description

        """
        paused = False
        _logger.info(f'Process {self.pid}: starting.')
        while True:
            command, data = self._queue.get()
            _logger.info(f'Process {self.pid}: received command {command}.')
            if (command == communication.WORKER_PACKAGE) and not paused:
                self._do_work(data)
            elif command == communication.WORKER_FINISH:
                self._clean_up()
                break
            elif command == communication.WORKER_STOP:
                self._clean_up()
                break
            elif (command == communication.WORKER_PAUSE) and not paused:
                paused = True
            elif (command == communication.WORKER_UNPAUSE) and paused:
                paused = False
            else:
                _logger.error(
                    f'Process {self.pid}: Ignoring \'{command}\' when paused is {paused}.'
                )
        _logger.info(f'Process {self.pid}: terminating.')


    def createInsert(self, exif: json, value:str) -> str:
        """Helper method for collecting all the values from the output of a file.

        Args:
            exif (json): the exif output
            value (str): the fist part of the string

        Returns:
            bool: string with the extracted values

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

        A work package can either consist of whole directories that are
        entirely processed or a list of filepaths of a directory that is
        evenly split across the worker processes.

        Args:
            package (List[str]): work package to process

        """
        # for directory in package:
        #     values = f"('{self._tree_walk_id}', '{directory}', name, type, size, metadata)"
        insertin = f"""INSERT INTO files (crawl_id, dir_path, name, type, size, creation_time, access_time, modification_time, metadata, file_hash) """
        value = f"VALUES ('{self._tree_walk_id}', "
        try:
            process = subprocess.Popen([f'{self._exiftool}', '-json', *package], stdout=subprocess.PIPE)
            metadata = json.load(process.stdout)
            for result in metadata:
                # get the values
                values = self.createInsert(result, value)
                if values == '0':
                    #TODO Remove debuging print
                    print('Can\'t insert element into database because a core value is missing')
                    print(result)
                    continue
                # compute the hash256
                with open(f"{result['Directory']}/{result['FileName']}", "rb") as file:
                    bytes = file.read()
                    hash256 = hashlib.sha256(bytes).hexdigest()
                # insert into the database
                self._db_connection.insert_new_record(insertin + values + "'{}'".format(json.dumps(result)) + ', ' + f"'{hash256}'" + ')')
                # TODO Add directory to analyzed dirs if it was a usual work package
        except Exception as e:
            # print(e)
            pass
        # Check if all workers are done
        # The last one sets the finished event
        with self._lock:
            self._counter.value += 1
            if self._counter.value == self._num_workers:
                self._counter.value = 0
                self._finished.set()
                _logger.debug(f'Process {self.pid}: finished as last.')


    def _clean_up(self) -> None:
        """Clean up method for cleaning up all used resources."""
        _logger.debug(f'Process {self.pid}: cleaning up.')
        self._db_connection.close()
        # Empty the work package list. Otherwise BrokenPipe errors will appear
        # because the queue still contains items.
        # FIXME: the queue should already actually be empty.
        while not self._queue.empty():
            self._queue.get(False)
