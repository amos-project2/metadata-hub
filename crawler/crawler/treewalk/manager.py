"""The TreeWalkManager manages the worker processes.

TODO: Add description
"""


# Python imports
import os
import json
import queue
import logging
import threading
import multiprocessing
from typing import Tuple, Any


# Local imports
from . import tree_walk as tree_walk
from . import state as state
from . import worker as worker_mod
import crawler.database as database
import crawler.communication as communication
import crawler.services.environment as environment
from crawler.services.config import Config


_logger = logging.getLogger(__name__)


class TreeWalkManager(threading.Thread):

    def __init__(self):
        super(TreeWalkManager, self).__init__()
        self._workers = []
        self._num_workers = 0
        self._work_packages = []
        self._work_packages_split = []
        self._worker_lock = multiprocessing.Lock()
        self._worker_counter = multiprocessing.Value('i', 0)
        self._tree_walk_id = -1
        self._total = 0
        self._workers_finished = multiprocessing.Event()
        self._state = state.State()
        self._connection_data = dict(
            user=environment.env.DATABASE_USER,
            password=environment.env.DATABASE_PASSWORD,
            host=environment.env.DATABASE_HOST,
            port=environment.env.DATABASE_PORT,
            dbname=environment.env.DATABASE_NAME
        )
        self._db_connection = None # type: database.DatabaseConnection


    def _reset(self) -> None:
        """Reset the TreeWalkManager."""
        self._workers = []
        self._num_workers = 0
        self._work_packages = []
        self._work_packages_split = []
        self._tree_walk_id = -1
        self._total = 0
        self._state.set_ready()
        self._db_connection.close()
        self._db_connection = None


    def _get_number_of_work_packages(self) -> int:
        """Get the total number of work packages (directories).

        Returns:
            int: number of currently present work packages

        """
        total = sum([len(worker_list) for worker_list in self._work_packages])
        total += len(self._work_packages_split)
        return total


    def _work(self) -> bool:
        """Work on the work packages step by step.

        Returns:
            bool: True if finished, False otherwise

        """

        def work_single() -> None:
            """Work on the small work packages"""
            packages = []
            for index in range(self._num_workers):
                try:
                    work = self._work_packages[index].pop()
                    packages.append(work)
                except IndexError:
                    packages.append([])
                    pass
            self._work_packages = [items for items in self._work_packages if items]
            for index, package in enumerate(packages):
                _, queue = self._workers[index]
                queue.put((communication.WORKER_PACKAGE, package))
            self._workers_finished.wait()
            # The single packages contain file names, so retrive the directories here
            analyzed_dirs = list(set([
                os.path.dirname(directory)
                for worker_package in packages for directory in worker_package
            ]))
            self._db_connection.update_status(self._tree_walk_id, analyzed_dirs)
            self._workers_finished.clear()

        def work_split() -> None:
            """Work on the work packages that have to be split across workers."""
            directory = self._work_packages_split.pop()
            entries = [
                os.path.join(directory, entry)
                for entry in os.listdir(directory)
            ]
            files = [entry for entry in entries if os.path.isfile(entry)]
            tmp_lists = [[] for _ in range(self._num_workers)]
            for index, fpath in enumerate(files):
                tmp_lists[index % len(tmp_lists)].append(fpath)
            for index, package in enumerate(tmp_lists):
                _, queue = self._workers[index]
                queue.put((communication.WORKER_PACKAGE, package))
            self._workers_finished.wait()
            self._db_connection.update_status(self._tree_walk_id, [directory])
            self._workers_finished.clear()

        def check() -> bool:
            """Check if work packages are left.

            If no packages are left, invoke done for updating the DB.

            Returns:
                bool: True if finished, False otherwise

            """
            if (not self._work_packages) and (not self._work_packages_split):
                done()
                return True
            return False

        def done() -> None:
            """Finish the TreeWalk execution.

            Send the finish signal to each worker and update the database.
            """
            for _, queue in self._workers:
                queue.put((communication.WORKER_FINISH, None))
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_FINISHED
            )

        if self._work_packages:
            _logger.debug('Running single work package for each worker')
            work_single()
            return check()
        if self._work_packages_split:
            _logger.debug('Running split work package for each worker')
            work_split()
            return check()
        done()
        return True


    def run(self) -> None:
        """Run method of TreeWalk manager."""
        shutdown = False
        while True:
            check = False
            if self._state.is_running():
                try:
                    command, data = communication.manager_queue_input.get(False)
                    check = True
                except queue.Empty:
                    done = self._work()
                    if done:
                        self._reset()
            else:
                command, data = communication.manager_queue_input.get()
                check = True
            if check:
                if command == communication.MANAGER_INFO:
                    message, data = self._info()
                elif command == communication.MANAGER_PAUSE:
                    message, data = self._pause()
                elif command == communication.MANAGER_SHUTDOWN:
                    message, data = self._stop()
                    shutdown = True
                elif command == communication.MANAGER_START:
                    message, data = self._start(data)
                elif command == communication.MANAGER_STOP:
                    message, data = self._stop()
                elif command == communication.MANAGER_UNPAUSE:
                    message, data = self._unpause()
                else:
                    _logger.error(f'Received unknown command {command}')
                # Log the message and put the result to the output queue
                if message == communication.MANAGER_OK:
                    _logger.info(f'{command}: {message}')
                else:
                    _logger.warning(f'{command}: {message}')
                communication.manager_queue_output.put((message, data))
                if shutdown:
                    break
        _logger.info('Shutting TreeWalk down. Bye.')


    def _stop(self) -> Tuple[str, None]:
        """Stop the current execution of the TreeWalk.

        TODO: Update state in DB

        Returns:
            Tuple[str, None]: message and None (no data required)

        """
        message, data = ('', None)
        if self._state.is_ready():
            message = 'Attempted to stop when TreeWalk was ready.'
        else:
            for worker, worker_queue in self._workers:
                worker_queue.put((communication.WORKER_STOP, None))
                worker.join()
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_ABORTED
            )
            self._reset()
            message = communication.MANAGER_OK
        return (message, data)


    def _unpause(self) -> Tuple[str, None]:
        """Continue the paused execution.

        TODO: Update state in DB

        Returns:
            Tuple[str, None]: message and None (no data required)

        """
        message, data = ('', None)
        try:
            self._state.set_unpaused()
            for _, worker_queue in self._workers:
                worker_queue.put((communication.WORKER_UNPAUSE, None))
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_RUNNING
            )
            message = communication.MANAGER_OK
        except state.StateException as err:
            message = f'Attempted to continue. {str(err)}'
        return (message, data)


    def _info(self) -> Tuple[str, dict]:
        """Get information about the current state of the TreeWalk.

        Returns:
            Tuple[str, dict]: message (OK) and info data

        """
        message, data = (communication.MANAGER_OK, None)
        if self._state.is_ready():
            data = {
                'status': self._state.get_status(),
                'config': self._state.get_config()
            }
        else:
            packages_left = self._get_number_of_work_packages()
            progress = ((self._total - packages_left) / self._total) * 100.0
            data = {
                'status': self._state.get_status(),
                'config': self._state.get_config(),
                'progress': f'{progress:.2f}'
            }
        return (message, data)


    def _pause(self) -> Tuple[str, None]:
        """Pause the current execution of the TreeWalk.

        TODO: Update state in DB

        Returns:
            Tuple[str, None]: message and None (no data required)

        """
        message, data = ('', None)
        try:
            self._state.set_paused()
            for _, worker_queue in self._workers:
                worker_queue.put((communication.WORKER_PAUSE, None))
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_PAUSED
            )
            message = communication.MANAGER_OK
        except state.StateException as err:
            message = f'Attempted to pause. {str(err)}'
        return (message, data)


    def _start(self, config: Config) -> Tuple[str, None]:
        """Start the TreeWalk with given configuration.

        Args:
            config (Config): configuration of new TreeWalk

        Returns:
            Tuple[str, None]: message and None (no data required)

        """

        def prepare(config: Config) -> Tuple[int, int, list, list]:
            """Prepare the start of the TreeWalk.

            Initialize required data such as work packages or number of workers.

            Args:
                config (Config): config of the execution

            Returns:
                Tuple[int, int, list, list]:
                    (db_id, #workers, work_packages_single, work_packages_split)

            """
            # Prepare database
            self._db_connection = database.DatabaseConnection(self._connection_data)
            db_id = self._db_connection.insert_crawl(config)
            # Prepare number of workers
            number_of_workers = tree_walk.get_number_of_workers(
                config.get_options_power_level()
            )
            # Prepare analyzed dirs
            # FIXME: GET ALREADY PROCESSED NODES HERE
            analyzedDirectories = json.dumps({"analyzed directories": []})
            # Prepare work packages
            work_packages, split = tree_walk.create_work_packages(
                inputs=config.get_paths_inputs(),
                work_package_size=config.get_options_package_size(),
                number_of_workers=number_of_workers,
                already_processed=[]
            )
            return (db_id, number_of_workers, work_packages, split)


        # Check if it is ok to run
        if self._state.is_paused():
            return ('Attempted to start when TreeWalk was paused.', None)
        if self._state.is_running():
            return ('Attempted to start when TreeWalk was running.', None)
        # Prepare the data
        data = prepare(config)
        tree_walk_id, num_workers, work_packages, work_packages_split = data
        # Create the worker processes and start them
        for id_worker in range(num_workers):
            queue = multiprocessing.Queue()
            worker = worker_mod.Worker(
                queue=queue,
                config=config,
                connection_data=self._connection_data,
                tree_walk_id=tree_walk_id,
                lock=self._worker_lock,
                counter=self._worker_counter,
                finished=self._workers_finished,
                num_workers=num_workers
            )
            self._workers.append((worker, queue))
        for worker, _ in self._workers:
            worker.start()
        # Update the manager
        self._state.set_running(config)
        self._num_workers = num_workers
        self._work_packages = work_packages
        self._work_packages_split = work_packages_split
        self._total = self._get_number_of_work_packages()
        self._tree_walk_id = tree_walk_id
        return (communication.MANAGER_OK, None)
