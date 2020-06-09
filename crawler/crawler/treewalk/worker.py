"""Implementation of the worker process.

The worker process is implemented as a process instead of a thread because
of the Python GIL that prevents threads from parallel execution.
Running the exiftool and hashing files is a CPU-bounded task, thus processes
are required for speeding up the execution time.
"""


# Python imports
import json
import os
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
            str: string with the extracted values

        """
        # Make validity check (if any of these are missing, the element can't be inserted into the database)
        for element in ['Directory', 'FileName']:
            if element not in exif:
                return '0'


        # Extract the metadata for the 'files' table
        for i in ['Directory', 'FileName', 'FileType']:
            try:
                # FIXME: Quickfix for handling ' in filenames
                tmp = exif[i].replace("\'", "\'\'")
                value += f"'{tmp}', "
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

        def clean_up():
            # Check if all workers are done
            # The last one sets the finished event
            with self._lock:
                self._counter.value += 1
                if self._counter.value == self._num_workers:
                    self._counter.value = 0
                    self._finished.set()
                    _logger.debug(f'Process {self.pid}: finished as last.')

        # If the package is already empty
        if not package:
            clean_up()
            return
        try:
            process = subprocess.Popen([f'{self._exiftool}', '-json', *package], stdout=subprocess.PIPE)
            output = str(process.stdout.read(), 'utf-8') # FIXME better solution?
            if output:
                metadata = json.loads(output)
            else:
                clean_up()
                return
        except:
            _logger.error(f'Process {self.pid}: Error executing the exiftool in process.')
            return

        # create the default insert for the database
        insertin = ('INSERT INTO files '
                    '(crawl_id, dir_path, name, type, size, creation_time, access_time, modification_time, metadata'
                    ', file_hash, deleted) '
                    'VALUES ')
        # create the value string with the tree walk id already inserted
        value = (f'\'{self._tree_walk_id}\', ')
        inserts = []
        for result in metadata:

            # FIXME: Quickfix for handling ' in filenames
            for key, val in result.items():
                if isinstance(val, str) and "\'" in val:
                    result[key] = val.replace("\'", "\'\'")

            # get the exif output for file x
            values = self.createInsert(result, value)
            # Check if result is valid
            if values == '0':
                _logger.warning('Can\'t insert element into database because validity check failed.')
                continue
            # compute the hash256 and add it to the values string
            with open(f"{result['Directory']}/{result['FileName']}".replace("\'\'", "\'"), "rb") as file:
                bytes = file.read()
                hash256 = hashlib.sha256(bytes).hexdigest()
            # add the value string to the rest for insert batching
            inserts.append(f'({values}\'{json.dumps(result)}\', \'{hash256}\', \'False\')')

        # insert into the database
        try:
            self._db_connection.insert_new_record(insertin + ','.join(inserts))
        except Exception as e:
            _logger.warning(
                'There was an error inserting the batched results, inserting individually.'
            )
            # Try to insert each command indiviually and print out the problematic result
            for insert in inserts:
                try:
                    self._db_connection.insert_new_record(insertin + insert)
                except Exception as e:
                    _logger.warning('Failed inserting single file again.')
        clean_up()


    def _clean_up(self) -> None:
        """Clean up method for cleaning up all used resources."""
        _logger.debug(f'Process {self.pid}: cleaning up.')
        self._db_connection.close()
        # Empty the work package list. Otherwise BrokenPipe errors will appear
        # because the queue still contains items.
        # FIXME: the queue should already actually be empty.
        while not self._queue.empty():
            self._queue.get(False)
