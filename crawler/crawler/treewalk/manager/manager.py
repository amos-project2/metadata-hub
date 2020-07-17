"""The TreeWalkManager manages the worker processes.

The TWManager is the center component of the TreeWalk. It manages the TWWorker
and is responsible for pausing/continuing, etc.
The start action for new executions is only called by the TWScheduler.
"""


# Python imports
import os
import json
import queue
import logging
import inspect
import threading
import multiprocessing
from typing import Tuple, Any
from datetime import datetime

# Local imports
from .worker_control import WorkerControl
import crawler.treewalk as treewalk
import crawler.database as database
import crawler.communication as communication
import crawler.services.environment as environment
from crawler.services.config import Config


class TreeWalkManager(threading.Thread):

    def __init__(self, db_info: dict, measure_time: bool, state: treewalk.State):
        super(TreeWalkManager, self).__init__()
        self._roots = []
        self._workers = []
        self._num_workers = multiprocessing.Value('i', 0)
        self._work_packages = []
        self._work_packages_split = []
        self._worker_lock = multiprocessing.Lock()
        self._worker_counter = multiprocessing.Value('i', 0)
        self._tree_walk_id = -1
        self._total = 0
        self._workers_finished = multiprocessing.Event()
        self._workers_can_exit = multiprocessing.Event()
        self._state = state # type: treewalk.State
        self._connection_data = db_info
        self._measure_time = measure_time
        self._db_connection = None # type: database.DatabaseConnection
        self._time_start = 0
        self._config = None # type: Config
        self._functions = {
            communication.MANAGER_PAUSE: self._treewalk_pause,
            communication.MANAGER_SHUTDOWN: self._treewalk_shutdown,
            communication.MANAGER_START: self._treewalk_start,
            communication.MANAGER_STOP: self._treewalk_stop,
            communication.MANAGER_UNPAUSE: self._treewalk_unpause
        }
        self._shutdown = False


    def _reset(self) -> None:
        """Reset the TreeWalkManager."""
        self._roots = []
        self._workers = []
        self._num_workers.value = 0
        self._work_packages = []
        self._work_packages_split = []
        self._tree_walk_id = -1
        self._total = 0
        self._state.set_progress(0.0)
        self._state.set_ready()
        self._db_connection.close()
        self._db_connection = None
        self._time_start = 0
        self._config = None


    def _update_progress(self) -> None:
        """Update the progress value."""
        packages_left = self._get_number_of_work_packages()
        progress = ((self._total - packages_left) / self._total) * 100.0
        self._state.set_progress(progress)


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
            for index in range(self._num_workers.value):
                try:
                    work = self._work_packages[index].pop()
                    packages.append(work)
                except IndexError:
                    packages.append([])
                    pass
            self._work_packages = [items for items in self._work_packages if items]
            for index, package in enumerate(packages):
                worker_control = self._workers[index]
                command = communication.Command(
                    command=communication.WORKER_PACKAGE,
                    data=package
                )
                worker_control.queue_input.put(command)
            self._workers_finished.wait()
            self._workers_finished.clear()

        def work_split() -> None:
            """Work on the work packages that have to be split across workers."""
            directory = self._work_packages_split.pop()
            entries = [
                os.path.join(directory, entry)
                for entry in os.listdir(directory)
            ]
            files = [entry for entry in entries if os.path.isfile(entry)]
            work_packages = treewalk.chunkify_files(
                files=files,
                size=self._config.get_package_size()
            )
            # In each iteration, all workers must retrieve a work package.
            # Otherwise, the finish mechanism won't work.
            while len(work_packages) % self._num_workers.value != 0:
                work_packages.append([])
            while work_packages:
                for worker_control in self._workers:
                    package = work_packages.pop()
                    command = communication.Command(
                        command=communication.WORKER_PACKAGE,
                        data=package
                    )
                    worker_control.queue_input.put(command)
                self._workers_finished.wait()
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
            for worker_control in self._workers:
                worker_control.queue_input.put(command)
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_FINISHED
            )

        if self._work_packages:
            logging.debug('TWManager: running single work package.')
            work_single()
            self._update_progress()
            return check()
        if self._work_packages_split:
            logging.debug('TWManager: running split work package.')
            work_split()
            self._update_progress()
            return check()
        done()
        return True


    def _log_execution_time(self) -> None:
        """Log the execution time of the crawl.

        Logs the execution times if the measure time flag was specified in the
        settings.
        """
        if not self._measure_time:
            # The worker always puts an item in the output queue at the end.
            for worker_control in self._workers:
                _ = worker_control.queue_output.get()
            self._workers_can_exit.set()
            for worker_control in self._workers:
                worker_control.me.join()
            self._workers_can_exit.clear()
            return
        time_end = datetime.now()
        exiftool_time, db_time = ([], [])
        for worker_control in self._workers:
            response = worker_control.queue_output.get()
            this_exiftool_time, this_db_time = response.message
            exiftool_time.append(this_exiftool_time)
            db_time.append(this_db_time)
        self._workers_can_exit.set()
        for worker_control in self._workers:
            worker_control.me.join()
        self._workers_can_exit.clear()
        str_worker = (
            f'MAX-Worker: E={max(exiftool_time):.2f}s, '
            f'D={max(db_time):.2f}s'
        )
        str_manager = f'Manager: D={self._db_connection.get_time():.2f}s'
        str_diff = str(datetime.now() - self._time_start).total_seconds()
        logging.critical(
            f'TIME:: {str_worker} | {str_manager} | '
            f'Total: T={str_diff}'
        )


    def _update_workers(self, num_workers: int, reduce: bool) -> None:
        """Update the workers due to maximum resource consumption.

        Args:
            num_workers (int): new number of workers
            reduce (bool): if True reduce, otherwise increase

        """
        if reduce:
            diff = self._num_workers.value - num_workers
            command = communication.Command(
                command=communication.WORKER_STOP,
                data=None
            )
            to_kill = self._workers[:diff]
            del self._workers[:diff]
            for worker_control in to_kill:
                worker_control.queue_input.put(command)
                worker_control.queue_output.get()
            self._workers_can_exit.set()
            for worker_control in to_kill:
                worker_control.me.join()
            self._workers_can_exit.clear()
            logging.info(f'TWManager: reduced the number of workers by {diff}.')
        else:
            diff = num_workers - self._num_workers.value
            for id_worker in range(diff):
                queue_input = multiprocessing.Queue()
                queue_output = multiprocessing.Queue()
                worker = treewalk.Worker(
                    queue_input=queue_input,
                    queue_output=queue_output,
                    config=self._config,
                    connection_data=self._connection_data,
                    tree_walk_id=self._tree_walk_id,
                    lock=self._worker_lock,
                    counter=self._worker_counter,
                    finished=self._workers_finished,
                    num_workers=self._num_workers,
                    measure_time=self._measure_time,
                    event_can_exit=self._workers_can_exit
                )
                worker_control = WorkerControl(
                    worker=worker,
                    queue_input=queue_input,
                    queue_output=queue_output,
                    event_finished=self._workers_can_exit
                )
                self._workers.append(worker_control)
                worker.start()
            logging.info(f'TWManager: increased the number of workers by {diff}.')
        self._work_packages = treewalk.resize_work_packages(
            work_packages=self._work_packages,
            num_workers=num_workers
        )
        self._state.set_running_workers(num_workers)
        self._num_workers.value = num_workers


    def check_and_update_worker(self) -> None:
        """Check if number of workers should be updated."""
        try:
            max_cpu_level, max_num_workers = self._state.get_cpu_level()
        except treewalk.StateException:
            # No update of the number of workers is required
            return
        workers_by_config = treewalk.get_number_of_workers(
            self._config.get_cpu_level()
        )
        reduce = (max_cpu_level > 0) and (max_num_workers < self._num_workers.value)
        increase = (max_cpu_level < 0) and (workers_by_config > self._num_workers.value)
        self._worker_lock.acquire()
        if reduce:
            self._update_workers(num_workers=max_num_workers, reduce=True)
        if increase:
            self._update_workers(num_workers=workers_by_config, reduce=False)
        self._worker_lock.release()


    def exec(self, command: communication.Command) -> None:
        """Wrapper method for executing a TreeWalk command.

        Args:
            command (communication.Command): command to execute

        """
        logging.info(f'TWManager: running command {command.command}')
        try:
            func = self._functions[command.command]
        except KeyError:
            logging.error(f'TWManager: recevied unknown command {command.command}')
            return
        response = func(command.data)
        communication.manager_queue_output.put(response)


    def run(self) -> None:
        """Run method of TreeWalk manager."""
        logging.info('TWManager: Hello!')
        while True:
            check = False
            if self._state.is_running():
                self.check_and_update_worker()
                try:
                    command = communication.manager_queue_input.get(False)
                    check = True
                except queue.Empty:
                    done = self._work()
                    if done:
                        # Delete files that are persisted in the database,
                        # but have been deleted in the file system
                        # Remove the data from the database
                        self._db_connection.delete_lost(
                            self._tree_walk_id, self._roots
                        )
                        self._log_execution_time()
                        logging.info('TWManager: finished execution.')
                        self._reset()
            else:
                command = communication.manager_queue_input.get()
                check = True
            if check:
                self.exec(command)
                if self._shutdown:
                    break
        logging.info('TWManager: Goodbye!')


    def _treewalk_shutdown(self, data: Any) -> communication.Response:
        """Shutdown the TreeWalk.

        Args:
            data (Any): ignored, but required due to callback signature

        Returns:
            communication.Response: response object

        """
        response = self._treewalk_stop(None)
        self._shutdown = True
        return response


    def _treewalk_stop(self, data: Any) -> communication.Response:
        """Stop the current execution of the TreeWalk.

        Args:
            data (Any): ignored, but required due to callback signature

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
            for worker_control in self._workers:
                worker_control.queue_input.put(command)
                _ = worker_control.queue_output.get()
            self._workers_can_exit.set()
            for worker_control in self._workers:
                worker_control.me.join()
            self._workers_can_exit.clear()
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


    def _treewalk_unpause(self, data: Any) -> communication.Response:
        """Continue the paused execution.

        Args:
            data (Any): ignored, but required due to callback signature

        Returns:
            communication.Response: response object

        """
        try:
            self._state.set_unpaused()
            command = communication.Command(
                command=communication.WORKER_UNPAUSE,
                data=None
            )
            for worker_control in self._workers:
                worker_control.queue_input.put(command)
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


    def _treewalk_pause(self, data: Any) -> communication.Response:
        """Pause the current execution of the TreeWalk.

        Args:
            data (Any): ignored, but required due to callback signature

        Returns:
            communication.Response: response object

        """
        try:
            self._state.set_paused()
            command = communication.Command(
                command=communication.WORKER_PAUSE,
                data=None
            )
            for worker_control in self._workers:
                worker_control.queue_input.put(command)
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


    def _treewalk_start(self, config: Config) -> communication.Response:
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
            max_cpu_level, max_num_workers = self._state.get_cpu_level(True)
            if max_cpu_level > 0:
                actual = number_of_workers
                number_of_workers = min(max_num_workers, number_of_workers)
                logging.info(
                    f'Reduced the number of workers by '
                    f'{abs(max_num_workers - actual)} '
                    f'due to interval restriction.'
                )
            # Prepare work packages
            work_packages, split = treewalk.create_work_packages(
                inputs=config.get_directories(),
                work_package_size=config.get_package_size(),
                number_of_workers=number_of_workers,
                already_processed=[]
            )
            return (db_id, number_of_workers, work_packages, split)


        # Check if it is ok to run (preparing doesn't have to checked
        # since it cannot be interrupted)
        if self._state.is_paused():
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk was paused.',
                command=communication.MANAGER_START
            )
        if self._state.is_running():
            logging.info('TWManager: attempted to start when TW is running.')
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk is running.',
                command=communication.MANAGER_START
            )

        self._state.set_preparing(config)
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
                num_workers=self._num_workers,
                measure_time=self._measure_time,
                event_can_exit=self._workers_can_exit
            )
            worker_control = WorkerControl(
                worker=worker,
                queue_input=queue_input,
                queue_output=queue_output,
                event_finished=self._workers_can_exit
            )
            self._workers.append(worker_control)
        for worker_control in self._workers:
            worker_control.me.start()
        # Update the manager
        self._config = config
        self._roots = config.get_directories()
        self._num_workers.value = num_workers
        self._work_packages = work_packages
        self._work_packages_split = work_packages_split
        self._total = self._get_number_of_work_packages()
        self._tree_walk_id = tree_walk_id
        self._state.set_running(config)
        self._state.set_running_workers(self._num_workers.value)
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
            command=communication.MANAGER_START
        )
