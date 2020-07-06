"""Implementation of the worker process.

The worker process is implemented as a process instead of a thread because
of the Python GIL that prevents threads from parallel execution.
Running the exiftool and hashing files is a CPU-bounded task, thus processes
are required for speeding up the execution time.
"""

# Python imports
import json
import time
import os
import queue
import hashlib
import logging
import subprocess
import multiprocessing
from typing import List, Tuple, Dict
from datetime import datetime


# Local imports
from . import utils
from crawler.services.config import Config
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
        identifier: int,
        input_data_queue: multiprocessing.Queue,
        input_command_queue: multiprocessing.Queue,
        config: Config,
        tree_walk_id: int,
        lock: multiprocessing.Lock,
        counter: multiprocessing.Value,
        num_workers: multiprocessing.Value,
        work_packages_done: multiprocessing.Value,
        db_thread_input_queue_data: multiprocessing.Queue,
        measure_time: bool
    ):
        super(Worker, self).__init__()
        self._logger = logging.getLogger(f'Worker {identifier}')
        self._identifier = identifier
        self._input_data_queue = input_data_queue
        self._input_command_queue = input_command_queue
        self._work_packages_done = work_packages_done
        self._db_thread_input_queue_data = db_thread_input_queue_data
        self._tw_config = config
        self._tree_walk_id = tree_walk_id
        self._lock = lock
        self._counter = counter
        self._measure_time = measure_time
        self._shutdown = False
        self._exiftool = self._tw_config.get_exiftool_executable()
        self._num_workers = num_workers
        self._exiftool_time = 0
        self._functions = {
            communication.WORKER_STOP: self.worker_stop,
            communication.WORKER_PAUSE: self.worker_pause,
        }

    @staticmethod
    def clear_queue(my_queue) -> None:
        """Completely empty a multiprocessing queue.

        Args:
            my_queue (multiprocessing.Queue): queue to clear

        """
        while True:
            try:
                my_queue.get(block=False)
            except queue.Empty:
                return

    def log_time(self) -> None:
        """Log the execution times before exiting."""
        if not self._measure_time:
            return
        self._logger.critical(
            f'Worker {self._identifier} (TIME): '
            f'ExifTool={self._exiftool_time:.2f} '
        )

    def worker_clean_up(self) -> None:
        """Clean up method for cleaning up all used resources."""
        self._logger.info(f'Worker {self._identifier}: cleaning up.')
        self._shutdown = True
        with self._lock:
            self._counter.value += 1
            if self._counter.value == self._num_workers.value:
                command = communication.Command(
                    command=communication.DATABASE_THREAD_FINISH,
                    data=None
                )
                self._db_thread_input_queue_data.put(command)
                self._logger.info(f'Worker {self._identifier}: finished as last.')

    def worker_stop(self) -> None:
        """Stop the worker.

        Clear queues the worker is responsible of, otherwise the process will
        end up in a deadlock.
        """
        self._shutdown = True
        Worker.clear_queue(self._input_data_queue)
        with self._lock:
            self._counter.value += 1
            print(f'worker {self._identifier} stopped {self._counter.value}')
            if self._counter.value == self._num_workers.value:
                Worker.clear_queue(self._db_thread_input_queue_data)

    def worker_pause(self) -> None:
        """TWManager should only call stop/continue here."""
        command = self._input_command_queue.get(block=True) # type: communication.Command
        if command.command == communication.WORKER_STOP:
            self.worker_stop()
        # Otherwise, the command is unpause, so it's okay to just return here

    def run(self) -> None:
        """Run the worker process."""
        self._logger.info(f'Hello Worker {self._identifier}.')
        while True:
            if self._shutdown:
                break
            try:
                command = self._input_command_queue.get(block=False)
            except queue.Empty:
                try:
                    self._do_work()
                except:
                    pass
                continue
            self._functions[command.command]()
        self.log_time()
        while True:
            if self._counter.value == self._num_workers.value:
                break

    def increase_work_done(self) -> None:
        """Increase the number of done work packages."""
        with self._lock:
            self._work_packages_done.value += 1

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
                stdout=subprocess.PIPE
            )
            # FIXME better solution?
            output = str(process.stdout.read(), 'utf-8')
            if output:
                metadata = json.loads(output)
            else:
                return None
        except:
            self._logger.error(
                f'Worker {self._identifier}: Error executing ExifTool.'
            )
            return None
        return metadata

    def _do_work(self) -> None:
        """Process the work package.

        A work package can either consist of whole directories that are
        entirely processed or a list of filepaths of a directory that is
        evenly split across the worker processes.

        """
        try:
            package = self._input_data_queue.get(block=False) # type: List[str]
        except queue.Empty:
            self.worker_clean_up()
            return
        # FIXME: If the package is already empty - do we still need this?
        if not package:
            self.increase_work_done()
            return
        # Run the exiftool
        metadata = self.run_exiftool(package)
        if metadata is None:
            # TODO: Error logging
            self.increase_work_done()
            return

        # Create inserts
        inserts = []
        tag_values = []
        for result in metadata:
            # get the exif output for file x
            insert_values = utils.create_insert(self._tree_walk_id, result)
            # Check if result is valid
            if insert_values[0] == 0:
                self._logger.warning('Can\'t insert element into database because validity check failed.')
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

        # Assign the database work to the dedicated thread.
        command = communication.Command(
            command=communication.DATABASE_THREAD_WORK, data=inserts
        )
        self._db_thread_input_queue_data.put(command)
        self.increase_work_done()

        # FIXME: These parts should be placed in the DB THREADS.
        """

        # insert into the database
        try:
            # Insert the result in a batched query
            self._db_connection.insert_new_record_files(inserts)
        except Exception as e:
            print(e)
            self._logger.warning(
                'There was an error inserting the batched results, inserting individually.'
            )
            # Try to insert each command individually and print out the problematic result
            for insert in inserts:
                try:
                    self._db_connection.insert_new_record_files([insert])
                except:
                    self._logger.warning('Failed inserting single file again.')

        # Update the values in the 'metadata' table
        try:
            # Create a comprehensive dictionary of all updates to be made in the 'metadata' table
            metadata_list = utils.create_metadata_list([json.loads(j[5]) for j in inserts])
            # Put the new information into the database
            self._db_connection.update_metadata(metadata_list)
        except:
            self._logger.warning("Error updating metadata")

        # Check if there was a previous entry in the database
        # if yes: Set the tag in the database to true
        toDelete = []
        directories = set([x[1] for x in inserts])
        try:
            for dir in directories:
                file_ids = self._db_connection.check_directory(dir, [x[-2] for x in inserts])
                if file_ids:
                    toDelete.extend(file_ids)
            if len(toDelete) > 0:
                # Decrease the dynamic tags in 'metadata' table
                self._db_connection.decrease_dynamic(toDelete)
                # Delete the files
                self._db_connection.delete_files(toDelete)
        except Exception as e:
            print(e)
            self._logger.warning(
                'There was an error setting the deleted tags. Manual check necessary!'
            )
        """
