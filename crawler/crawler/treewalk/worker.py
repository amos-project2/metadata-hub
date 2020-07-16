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
import multiprocessing
from typing import List, Tuple, Dict
from datetime import datetime

# 3rd party imports
from psycopg2.extensions import connection

# Local imports
from crawler.services.config import Config
import crawler.database as database
import crawler.communication as communication

_logger = logging.getLogger(__name__)


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
        event_can_exit: multiprocessing.Event
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

    def run(self) -> None:
        """Run the worker process."""
        paused = False
        _logger.info(f'Process {self.pid}: starting.')
        while True:
            command = self._queue_input.get()
            _logger.debug(
                f'Process {self.pid}: received command {command.command}.'
            )
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
                _logger.error(
                    f'Process {self.pid}: Ignoring \'{command}\' when paused is {paused}.'
                )
        _logger.info(f'Process {self.pid}: terminating.')

    def createInsert(self, crawl_id: int, exif: json) -> Tuple[str]:
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
                return (0,)

        # Create tuple for values
        insert_values = (crawl_id,)

        # Extract the metadata for the 'files' table
        for i in ['Directory', 'FileName', 'FileType']:
            try:
                insert_values += (exif[i],)
            except:
                insert_values += ('NULL',)
        for i in ['FileSize']:
            try:
                val = exif[i]
                insert_values += (val,)
            except:
                insert_values += (None,)
        try:
            # TODO better fix than dumping the json in the worker (after extracting the single file tags)
            insert_values += (json.dumps(exif),)
        except:
            insert_values += ('NULL',)
        for i in ['FileAccessDate', 'FileModifyDate', 'FileCreationDate']:
            try:
                valueTmp = f'{exif[i]}'
                valueFormat = valueTmp[:12].replace(':', '-') + valueTmp[13:]
                if valueFormat == '0000-00-00 0:00:00':
                    insert_values += ('-infinity',)
                else:
                    insert_values += (valueFormat,)
            except:
                insert_values += ('-infinity',)
        insert_values += (False, '-infinity')
        return insert_values

    # def getSize(self, size: str) -> int:
    #     """Convert the size into bytes
    #
    #     Args:
    #         size (str): the exif output for size
    #
    #     Returns:
    #         str: string with the value in bytes
    #
    #     """
    #
    #     unit = size.split(' ')[1]
    #     multipl = 1
    #     if unit[0] == 'k':
    #         multipl = 1000
    #     elif unit[0] == 'm':
    #         multipl = 1000000
    #     elif unit[0] == 'g':
    #         multipl = 1000000000
    #     elif unit[0] == 't':
    #         multipl = 1000000000000
    #     return int(size.split(' ')[0]) * multipl

    # def create_metadata_list(self, exif_output: json) -> Dict:
    #     """Creates an easy to process dictionary for updating the 'metadata' table in the database
    #
    #     Args:
    #         exif_output (json): The output from the ExifTool output.
    #     Returns:
    #         Dict: key: file type | value: Dict: key: tag value: count
    #     """
    #     # Loop over every tag for each file in the ExifTool output and add them to the dictionary
    #     tag_values = {}
    #     for single_output in exif_output:
    #         fileType = single_output['FileType']
    #         if fileType not in tag_values:
    #             tag_values[fileType] = {}
    #         for tag_value in single_output:
    #             test = dict(single_output)
    #             if tag_value in tag_values[fileType]:
    #                 tag_values[fileType][tag_value][0] += 1
    #             else:
    #                 tag_values[fileType][tag_value] = [1, '?']
    #             if tag_values[fileType][tag_value][1] == '?':
    #                 tag_values[fileType][tag_value][1] = self.output_type(test[tag_value])
    #     return tag_values

    def create_metadata_increase(self, exif_output: json) -> Dict:
        """Creates an easy to process dictionary for updating the 'metadata' table.
        Loop over every tag for each file in the ExifTool output and add them to
        the dictionary.
        Args:
            exif_output (json): The output from the ExifTool output.
        Returns:
            Dict: key: file type | value: Dict: key: tag value: count
        """
        tag_values = {}
        for single_output in exif_output:
            fileType = single_output['FileType']
            if fileType not in tag_values:
                tag_values[fileType] = {}
            for tag_value in single_output:
                test = dict(single_output)
                if tag_value in tag_values[fileType]:
                    tag_values[fileType][tag_value][0] += 1
                else:
                    tag_values[fileType][tag_value] = [1, '?']
                if tag_values[fileType][tag_value][1] == '?':
                    tag_values[fileType][tag_value][1] = self.output_type(test[tag_value])
        return tag_values

    def create_metadata_decrease(self, exif_output: json) -> Dict:
        """Creates an easy to process dictionary for updating the 'metadata' table in the database
        Args:
            exif_output (json): The output from the ExifTool output.
        Returns:
            Dict: key: file type | value: Dict: key: tag value: count
        """
        # Loop over every tag for each file in the ExifTool output and add them to the dictionary
        tag_values = {}
        for single_output in exif_output:
            fileType = single_output['FileType']
            if fileType not in tag_values:
                tag_values[fileType] = {}
            for tag_value in single_output:
                test = dict(single_output)
                if tag_value in tag_values[fileType]:
                    tag_values[fileType][tag_value][0] -= 1
                else:
                    tag_values[fileType][tag_value] = [-1, '?']
                if tag_values[fileType][tag_value][1] == '?':
                    tag_values[fileType][tag_value][1] = self.output_type(test[tag_value])
        return tag_values

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
            _logger.error(
                f'Process {self.pid}: Error executing the exiftool in process.'
            )
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
                    _logger.debug(f'Process {self.pid}: finished as last.')

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
            insert_values = self.createInsert(self._tree_walk_id, result)
            # Check if result is valid
            if insert_values[0] == 0:
                _logger.warning('Can\'t insert element into database because validity check failed.')
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
            print(e)
            _logger.warning(
                'There was an error inserting the batched results, inserting individually.'
            )
            # Try to insert each command individually and print out the problematic result
            for insert in inserts:
                try:
                    self._db_connection.insert_new_record_files([insert])
                except:
                    _logger.warning('Failed inserting single file again.')

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
            print(e)
            _logger.warning(
                'There was an error setting the deleted tags. Manual check necessary!'
            )
        # Update the values in the 'metadata' table
        try:
            # Create comprehensive dictionaries of all increases and decreases to be made in the 'metadata' table
            metadata_increase = self.create_metadata_increase([json.loads(j[5]) for j in inserts])
            metadata_decrease = self.create_metadata_decrease(jsons)
            # Put the new information into the database
            self._db_connection.update_metadata(metadata_increase, metadata_decrease)
        except:
            _logger.warning("Error updating metadata")
        clean_up()

    def _clean_up(self) -> None:
        """Clean up method for cleaning up all used resources."""
        _logger.debug(f'Process {self.pid}: cleaning up.')
        self._db_connection.close()
        response = communication.Response(
            success=True,
            message=(self._exiftool_time, self._db_connection.get_time()),
            command=communication.WORKER_FINISH
        )
        self._queue_output.put(response)
        self._event_can_exit.wait()
