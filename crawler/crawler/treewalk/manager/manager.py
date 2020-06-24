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
from datetime import datetime

# Local imports
import crawler.treewalk as treewalk
import crawler.database as database
import crawler.communication as communication
import crawler.services.environment as environment
from crawler.services.config import Config


_logger = logging.getLogger(__name__)


class TreeWalkManager(threading.Thread):

    def __init__(self, db_info: dict, measure_time: bool, state: treewalk.State):
        super(TreeWalkManager, self).__init__()
        self._roots = []
        self._workers = []
        self._num_workers = 0
        self._work_packages = []
        self._work_packages_split = []
        self._worker_lock = multiprocessing.Lock()
        self._worker_counter = multiprocessing.Value('i', 0)
        self._tree_walk_id = -1
        self._total = 0
        self._workers_finished = multiprocessing.Event()
        self._state = state
        self._connection_data = db_info
        self._measure_time = measure_time
        self._db_connection = None # type: database.DatabaseConnection
        self._time_start = 0


    def _reset(self) -> None:
        """Reset the TreeWalkManager."""
        self._roots = []
        self._workers = []
        self._num_workers = 0
        self._work_packages = []
        self._work_packages_split = []
        self._tree_walk_id = -1
        self._total = 0
        self._state.set_ready()
        self._db_connection.close()
        self._db_connection = None
        self._time_start = 0


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
                _, queue_input, _ = self._workers[index]
                command = communication.Command(
                    command=communication.WORKER_PACKAGE,
                    data=package
                )
                queue_input.put(command)
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
                _, queue_input, _ = self._workers[index]
                command = communication.Command(
                    command=communication.WORKER_PACKAGE,
                    data=package
                )
                queue_input.put(command)
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
            """Send the finish signal to each worker and update the database."""
            command = communication.Command(
                command=communication.WORKER_FINISH,
                data=None
            )
            for _, queue_input, _ in self._workers:
                queue_input.put(command)
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

    def _log_execution_time(self) -> None:
        """Log the execution time of the crawl.

        Logs the execution times if the measure time flag was specified in the
        settings.
        """
        if not self._measure_time:
            return
        time_end = datetime.now()
        exiftool_time, db_time = ([], [])
        for _, _, output_queue in self._workers:
            response = output_queue.get()
            this_exiftool_time, this_db_time = response.message
            exiftool_time.append(this_exiftool_time)
            db_time.append(this_db_time)
        str_worker = (
            f'MAX-Worker: E={max(exiftool_time):.2f}s, '
            f'D={max(db_time):.2f}s'
        )
        str_manager = f'Manager: D={self._db_connection.get_time():.2f}s'
        str_diff = str(datetime.now() - self._time_start)
        logging.critical(
            f'TIME:: {str_worker} | {str_manager} | '
            f'Total: T={str_diff}'
        )

    def run(self) -> None:
        """Run method of TreeWalk manager."""
        shutdown = False
        while True:
            check = False
            if self._state.is_running():
                try:
                    command = communication.manager_queue_input.get(False)
                    check = True
                except queue.Empty:
                    done = self._work()
                    if done:
                        # Delete files that are persisted in the database, but have been deleted in the file system
                        # Remove the data from the database
                        self._db_connection.delete_lost(self._tree_walk_id, self._roots)
                        self._log_execution_time()
                        self._reset()
            else:
                command = communication.manager_queue_input.get()
                check = True
            if check:
                if command.command == communication.MANAGER_INFO:
                    response = self._info()
                elif command.command == communication.MANAGER_PAUSE:
                    response = self._pause()
                elif command.command == communication.MANAGER_SHUTDOWN:
                    response = self._stop()
                    shutdown = True
                elif command.command == communication.MANAGER_START:
                    self._time_start = datetime.now()
                    response = self._start(command.data)
                elif command.command == communication.MANAGER_STOP:
                    response = self._stop()
                elif command.command == communication.MANAGER_UNPAUSE:
                    response = self._unpause()
                else:
                    _logger.error(f'Received unknown command {command}')
                # Log the message and put the result to the output queue
                if response.success:
                    _logger.info(f'{response.command}: {response.message}')
                else:
                    _logger.warning(f'{response.command}: {response.message}')
                communication.manager_queue_output.put(response)
                if shutdown:
                    break
        _logger.info('Shutting TreeWalk down. Bye.')


    def _stop(self) -> communication.Response:
        """Stop the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        if self._state.is_ready():
            message = 'Attempted to stop when TreeWalk was ready.'
        else:
            command = communication.Command(
                command=communication.WORKER_STOP,
                data=None
            )
            for worker, queue_input, queue_output in self._workers:
                queue_input.put(command)
                worker.join()
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_ABORTED
            )
            self._reset()
            message = communication.MANAGER_OK
        return communication.Response(
            success=True,
            message=message,
            command=communication.MANAGER_STOP
        )


    def _unpause(self) -> communication.Response:
        """Continue the paused execution.

        Returns:
            communication.Response: response object

        """
        try:
            self._state.set_unpaused()
            command = communication.Command(
                command=communication.WORKER_UNPAUSE,
                data=None
            )
            for _, queue_input, _ in self._workers:
                queue_input.put(command)
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_RUNNING
            )
            success = True
            message = communication.MANAGER_OK
        except treewalk.StateException as err:
            success = False
            message = f'Attempted to continue. {str(err)}'
        return communication.Response(
            success=success,
            message=message,
            command=communication.MANAGER_UNPAUSE
        )


    def _info(self) -> communication.Response:
        """Get information about the current state of the TreeWalk.

        Returns:
            communication.Response: response object

        """
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
        return communication.Response(
            success=True,
            message=data,
            command=communication.MANAGER_INFO
        )


    def _pause(self) -> communication.Response:
        """Pause the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        try:
            self._state.set_paused()
            command = communication.Command(
                command=communication.WORKER_PAUSE,
                data=None
            )
            for _, queue_input, _ in self._workers:
                queue_input.put(command)
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_PAUSED
            )
            success = True
            message = communication.MANAGER_OK
        except treewalk.StateException as err:
            success = False
            message = f'Attempted to pause. {str(err)}'
        return communication.Response(
            success=success,
            message=message,
            command=communication.MANAGER_PAUSE
        )


    def _start(self, config: Config) -> communication.Response:
        """Start the TreeWalk with given configuration.

        Args:
            config (Config): configuration of new TreeWalk

        Returns:
            communication.Response: response object

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
            self._db_connection = database.DatabaseConnection(
                db_info=self._connection_data,
                measure_time=self._measure_time
            )
            db_id = self._db_connection.insert_new_record_crawls(config)
            # Prepare number of workers
            number_of_workers = treewalk.get_number_of_workers(
                config.get_cpu_level()
            )
            # Prepare analyzed dirs
            # FIXME: GET ALREADY PROCESSED NODES HERE
            analyzedDirectories = json.dumps({"analyzed directories": []})
            # Prepare work packages
            work_packages, split = treewalk.create_work_packages(
                inputs=config.get_directories(),
                work_package_size=config.get_package_size(),
                number_of_workers=number_of_workers,
                already_processed=[]
            )
            return (db_id, number_of_workers, work_packages, split)


        # Check if it is ok to run
        if self._state.is_paused():
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk was paused.',
                command=communication.MANAGER_START
            )
        if self._state.is_running():
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk is running.',
                command=communication.MANAGER_START
            )
        # Prepare the data
        data = prepare(config)
        tree_walk_id, num_workers, work_packages, work_packages_split = data
        # Create the worker processes and start them
        for id_worker in range(num_workers):
            queue_input = multiprocessing.Queue()
            queue_output = multiprocessing.Queue()
            worker = treewalk.Worker(
                queue_input=queue_input,
                queue_output=queue_output,
                config=config,
                connection_data=self._connection_data,
                tree_walk_id=tree_walk_id,
                lock=self._worker_lock,
                counter=self._worker_counter,
                finished=self._workers_finished,
                num_workers=num_workers,
                measure_time=self._measure_time
            )
            self._workers.append((worker, queue_input, queue_output))
        for worker, _, _ in self._workers:
            worker.start()
        # Update the manager
        self._roots = config.get_directories()
        self._state.set_running(config)
        self._num_workers = num_workers
        self._work_packages = work_packages
        self._work_packages_split = work_packages_split
        self._total = self._get_number_of_work_packages()
        self._tree_walk_id = tree_walk_id
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
            command=communication.MANAGER_START
        )
