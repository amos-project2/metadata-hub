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
import subprocess
import multiprocessing
from typing import List, Tuple, Dict
from datetime import datetime

# 3rd party imports
from psycopg2.extensions import connection

# Local imports
from .utils import (
    create_metadata,
    create_insert
)
from crawler.services.config import Config
import crawler.database as database
import crawler.communication as communication


def measure_exiftool(func):
    """Decorator for time measurement of the exiftool execution.

    This decorator is used for roughly estimate the time spent for running
    the ExifTool on the work packages.

    Args:
        func (function): function to wrap

    """

    def decorator(self, *args, **kwargs):
        if self._measure_time:
            start = datetime.now()
            result = func(self, *args, **kwargs)
            end = datetime.now()
            self._exiftool_time += (end - start).total_seconds()
        else:
            result = func(self, *args, **kwargs)
        return result

    return decorator


class Worker(multiprocessing.Process):

    def __init__(
        self,
        queue_input: multiprocessing.Queue,
        queue_output: multiprocessing.Queue,
        config: Config,
        connection_data: dict,
        tree_walk_id: int,
        lock: multiprocessing.Lock,
        counter: multiprocessing.Value,
        finished: multiprocessing.Event,
        num_workers: multiprocessing.Value,
        measure_time: bool,
        event_can_exit: multiprocessing.Event,
        debug: bool
    ):
        super(Worker, self).__init__()
        self._queue_input = queue_input
        self._queue_output = queue_output
        self._config = config
        self._tree_walk_id = tree_walk_id
        self._lock = lock
        self._counter = counter
        self._measure_time = measure_time
        self._db_connection = database.DatabaseConnection(
            db_info=connection_data,
            measure_time=self._measure_time
        )
        self._exiftool = self._config.get_exiftool_executable()
        self._finished = finished
        self._num_workers = num_workers
        self._exiftool_time = 0
        self._event_can_exit = event_can_exit
        self._debug = debug


    def message(self, msg: str, ignore: bool = False) -> None:
        """Print message to the console if logging level was set to DEBUG.

        Args:
            msg (str): message to print to the console
            ignore (bool): if set to true, print message anyway

        """
        if self._debug or ignore:
            print(f'TWWorker {self.pid}: {msg}')


    def run(self) -> None:
        """Run the worker process."""
        paused = False
        self.message('Hello!')
        while True:
            command = self._queue_input.get()
            self.message(f'received command {command.command}.')
            if (command.command == communication.WORKER_PACKAGE) and not paused:
                self._do_work(command.data)
            elif command.command == communication.WORKER_FINISH:
                self._clean_up()
                break
            elif command.command == communication.WORKER_STOP:
                self._clean_up()
                break
            elif (command.command == communication.WORKER_PAUSE) and not paused:
                paused = True
            elif (command.command == communication.WORKER_UNPAUSE) and paused:
                paused = False
            else:
                self.message(
                    f'ignoring \'{command}\' when paused is \'{paused}\'.'
                )
        self.message('Goodybe!')


    @measure_exiftool
    def run_exiftool(self, package: List[str]) -> dict:
        """Run the ExifTool on the package.

        Args:
            package (List[str]): work package

        Returns:
            dict: metadata output or None on error

        """
        try:
            process = subprocess.Popen(
                [f'{self._exiftool}', '-n', '-json', *package],
                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
            )
            # FIXME better solution?
            output = str(process.stdout.read(), 'utf-8')
            if output:
                metadata = json.loads(output)
            else:
                return None
        except:
            self.message('error executing the ExifTool!', ignore=True)
            return None
        return metadata


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
                if self._counter.value == self._num_workers.value:
                    self._counter.value = 0
                    self._finished.set()
                    self.message('finished as last.')

        # If the package is already empty
        if not package:
            clean_up()
            return
        # Run the exiftool
        metadata = self.run_exiftool(package)
        if metadata is None:
            clean_up()
            return
        inserts = []
        tag_values = []
        for result in metadata:
            # get the exif output for file x
            insert_values = create_insert(self._tree_walk_id, result)
            # Check if result is valid
            if insert_values[0] == 0:
                self.message(
                    'can\'t insert element into database because validity check failed.',
                    ignore=True
                )
                continue
            # compute the hash256 and add it to the values string
            with open(f"{result['Directory']}/{result['FileName']}".replace("\'\'", "\'"), "rb") as file:
                bytes = file.read()
                hash256 = hashlib.sha256(bytes).hexdigest()
                insert_values += (hash256, False)
            # add the value string to the rest for insert batching
            # FIXME Better solution for ignoring files with no file_type?
            if insert_values[3] == 'NULL':
                continue
            inserts.append(insert_values)

        # insert into the database
        try:
            # Insert the result in a batched query
            self._db_connection.insert_new_record_files(inserts)
        except Exception as e:
            self.message(
                f'there was an error inserting the batched results, inserting individually: {str(e)}',
                ignore=True
            )
            # Try to insert each command individually and print out the problematic result
            for insert in inserts:
                try:
                    self._db_connection.insert_new_record_files([insert])
                except:
                    self.message('failed inserting single file again.', ignore=True)

        # Check if there was a previous entry in the database
        # if yes: Delete the file (files that were moved since then are deleted in the manager)
        toDelete = []
        directories = set([x[1] for x in inserts])
        # List of jsons with the old data (Used for the metadata management)
        jsons = []
        try:
            for dir in directories:
                file_ids = self._db_connection.check_directory(dir, [x[-2] for x in inserts])
                if file_ids:
                    toDelete.extend([x[0] for x in file_ids])
                    jsons.extend([x[1] for x in file_ids])
            if len(toDelete) > 0:
                # Delete the files
                self._db_connection.delete_files(toDelete)
        except Exception as e:
            self.message(
                f'there was an error setting the deleted tags. Manual check necessary: {str(e)}',
                ignore=True
            )
        # Update the values in the 'metadata' table
        try:
            # Create comprehensive dictionaries of all increases and
            # decreases to be made in the 'metadata' table.
            metadata_increase = create_metadata(
                exif_output=[json.loads(j[5]) for j in inserts],
                increase=True
            )
            metadata_decrease = create_metadata(
                exif_output=jsons, increase=False
            )
            # Put the new information into the database
            self._db_connection.update_metadata(metadata_increase, metadata_decrease)
        except:
            self.message('error updating metadata', ignore=True)
        clean_up()


    def _clean_up(self) -> None:
        """Clean up method for cleaning up all used resources."""
        self.message('cleaning up before exiting.')
        self._db_connection.close()
        response = communication.Response(
            success=True,
            message=(self._exiftool_time, self._db_connection.get_time()),
            command=communication.WORKER_FINISH
        )
        self._queue_output.put(response)
        self._event_can_exit.wait()
