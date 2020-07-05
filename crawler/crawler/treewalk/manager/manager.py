"""The TreeWalkManager manages the worker processes.

TODO: Add description
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
        self._workers = [] # # type: List[treewalk.Worker, multiprocessing.Queue, multiprocessing.Queue]
        self._worker_lock = multiprocessing.Lock()
        self._num_workers = multiprocessing.Value('i', 0)
        self._worker_counter = multiprocessing.Value('i', 0)
        self._work_packages_done = multiprocessing.Value('i', 0)
        self._finished = multiprocessing.Event() # type: multiprocessing.Event
        self._tree_walk_id = -1
        self._work_packages_total = 0
        self._state = state # type: treewalk.State
        self._connection_data = db_info
        self._measure_time = measure_time
        self._time_start = 0
        self._config = None # type: Config
        self._db_connection = database.DatabaseConnection(
            db_info=self._connection_data,
            measure_time=self._measure_time
        ) # type: database.DatabaseConnection
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
        self._state.get_finished(clear=True)
        self._time_start = 0
        self._config = None
        sleep_command = communication.Command(
            command=communication.DATABASE_THREAD_SLEEP, data=None
        )
        communication.database_thread_files_input_commands.put(sleep_command)
        communication.database_thread_metadata_input_commands.put(sleep_command)

    def _update_progress(self) -> None:
        """Update the progress value."""
        progress = self._work_packages_done.value / self._work_packages_total
        self._state.set_progress(progress * 100.0)

    def _log_execution_time(self) -> None:
        """Log the execution time of the crawl.

        Logs the execution times if the measure time flag was specified in the
        settings.
        """
        if not self._measure_time:
            return
        time_end = datetime.now()
        str_manager = f'TWManager (TIME): Database={self._db_connection.get_time():.2f}s'
        logging.critical(
            f'TWManager (Time): Database={self._db_connection.get_time():.2f}s '
            f'Total= {str(datetime.now() - self._time_start):.2f}s'
        )

    def _update_workers(self, num_workers: int, reduce: bool) -> None:
        """Update the workers due to maximum resource consumption.

        Args:
            num_workers (int): new number of workers
            reduce (bool): if True reduce, otherwise increase

        """
        # FIXME
        # TODO: in both cases, work packages must be reassigned
        if reduce:
            diff = self._num_workers.value - num_workers
            command = communication.Command(
                command=communication.WORKER_STOP,
                data=None
            )
            for worker_id in range(diff):
                worker, queue_input, queue_output = self._workers.pop()
                queue_input.put(command)
                queue_output.get()
                worker.join()
            _logger.info(
                f'Reduced the number of workers by {diff} due to interval restriction.'
            )
        else:
            diff = num_workers - self._num_workers.value
            for id_worker in range(diff):
                queue_input_ = multiprocessing.Queue()
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
                    measure_time=self._measure_time
                )
                self._workers.append((worker, queue_input, queue_output))
                worker.start()
            _logger.info(
                f'Increased the number of workers by {diff} due to no interval restriction.'
            )

        self._work_packages = treewalk.resize_work_packages(
            work_packages=self._work_packages,
            num_workers=num_workers
        )
        self._state.set_running_workers(num_workers)
        self._num_workers.value = num_workers


    def exec(self, command: communication.Command) -> None:
        try:
            func = self._functions[command.command]
        except KeyError:
            _logger.error(f'Manager recevied unknown command {command.command}')
            return
        response = func(command.data)
        if response.success:
            _logger.info(f'{response.command}: {response.message}')
        else:
            _logger.warning(f'{response.command}: {response.message}')
        communication.manager_queue_output.put(response)

    def check_and_update_worker(self) -> None:
        # FIXME
        max_cpu_level, max_num_workers = self._state.get_cpu_level()
        workers_by_config = treewalk.get_number_of_workers(
            self._config.get_cpu_level()
        )
        reduce = (max_cpu_level > 0) and (max_num_workers < self._num_workers.value)
        increase = (max_cpu_level < 0) and (workers_by_config > self._num_workers.value)
        check = increase or reduce
        if not check:
            return
        self._worker_lock.acquire()
        if reduce:
            self._update_workers(num_workers=max_num_workers, reduce=True)
        if increase:
            self._update_workers(num_workers=workers_by_config, reduce=False)
        self._worker_lock.release()


    def run(self) -> None:
        """Run method of TreeWalk manager."""
        _logger.info('Hello TWManager.')
        # Set the database threads to sleep
        sleep_command = communication.Command(
            command=communication.DATABASE_THREAD_SLEEP, data=None
        )
        communication.database_thread_files_input_commands.put(sleep_command)
        communication.database_thread_metadata_input_commands.put(sleep_command)
        while True:
            check = False
            if self._state.is_running():
                # FIXME: self.check_and_update_worker()
                self._update_progress()
                try:
                    command = communication.manager_queue_input.get(
                        block=True, timeout=1
                    )
                except queue.Empty:
                    if self._state.get_finished():
                        # Delete files that are persisted in the database,
                        # but have been deleted in the file system
                        # Remove the data from the database
                        _logger.info('TWManager: Finished execution.')
                        self._db_connection.delete_lost(
                            self._tree_walk_id, self._roots
                        )
                        self._log_execution_time()
                        self._reset()
                    continue
                self.exec(command)
            else:
                command = communication.manager_queue_input.get()
                self.exec(command)
            if self._shutdown:
                break
        _logger.info('Goodbye TWManager.')

    def _treewalk_shutdown(self, data: Any) -> communication.Response:
        """Stop the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        self._treewalk_stop(data)
        command = communication.Command(
            command=communication.DATABASE_THREAD_SHUTDOWN,
            data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        self._shutdown = True
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
            command=communication.MANAGER_SHUTDOWN
        )

    def _treewalk_stop(self, data: Any) -> communication.Response:
        """Stop the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        self._state.lock()
        response = communication.Response(
            success=True, message='', command=communication.MANAGER_STOP
        )
        if self._state.is_ready():
            response.message = 'Attempted to stop when TreeWalk was ready.'
            self._state.release()
            return response
        command = communication.Command(
            command=communication.WORKER_STOP,
            data=None
        )
        for worker, data_queue, command_queue in self._workers:
            command_queue.put(command)
        _logger.debug('Joining worker processes')
        for worker, data_queue, command_queue in self._workers:
            worker.join()
        command = communication.Command(
            command=communication.DATABASE_THREAD_STOP,
            data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        self._db_connection.set_crawl_state(
            tree_walk_id=self._tree_walk_id,
            status=communication.CRAWL_STATUS_ABORTED
        )
        self._reset()
        response.message = communication.MANAGER_OK
        self._state.release()
        return response

    def _treewalk_unpause(self, data: Any) -> communication.Response:
        """Continue the paused execution.

        Returns:
            communication.Response: response object

        """
        self._state.lock()
        try:
            self._state.set_unpaused()
            command = communication.Command(
                command=communication.WORKER_UNPAUSE,
                data=None
            )
            for _, _, command_queue in self._workers:
                command_queue.put(command)
            command = communication.Command(
                command=communication.DATABASE_THREAD_CONTINUE,
                data=None
            )
            communication.database_thread_files_input_commands.put(command)
            communication.database_thread_metadata_input_commands.put(command)
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_RUNNING
            )
            success = True
            message = communication.MANAGER_OK
        except treewalk.StateException as err:
            success = False
            message = f'Attempted to continue. {str(err)}'
        self._state.release()
        return communication.Response(
            success=success,
            message=message,
            command=communication.MANAGER_UNPAUSE
        )

    def _treewalk_pause(self, data: Any) -> communication.Response:
        """Pause the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        self._state.lock()
        try:
            self._state.set_paused()
            command = communication.Command(
                command=communication.WORKER_PAUSE,
                data=None
            )
            for _, _, command_queue in self._workers:
                command_queue.put(command)
            command = communication.Command(
                command=communication.DATABASE_THREAD_PAUSE,
                data=None
            )
            communication.database_thread_files_input_commands.put(command)
            communication.database_thread_metadata_input_commands.put(command)
            self._db_connection.set_crawl_state(
                tree_walk_id=self._tree_walk_id,
                status=communication.CRAWL_STATUS_PAUSED
            )
            success = True
            message = communication.MANAGER_OK
        except treewalk.StateException as err:
            success = False
            message = f'Attempted to pause. {str(err)}'
        self._state.release()
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
                    (db_id, #workers, work_packages)

            """
            # Prepare database
            db_id = self._db_connection.insert_new_record_crawls(config)
            # Prepare number of workers
            number_of_workers = treewalk.get_number_of_workers(
                config.get_cpu_level()
            )
            max_cpu_level, max_num_workers = self._state.get_cpu_level()
            if max_cpu_level > 0:
                actual = number_of_workers
                number_of_workers = min(max_num_workers, number_of_workers)
                _logger.info(
                    f'Reduced the number of workers by '
                    f'{abs(max_num_workers - actual)} '
                    f'due to interval restriction.'
                )
            # Prepare work packages
            work_packages = treewalk.create_work_packages(
                inputs=config.get_directories(),
                work_package_size=config.get_package_size(),
                number_of_workers=number_of_workers
            )
            return (db_id, number_of_workers, work_packages)

        self._state.lock()
        if self._state.is_paused():
            self._state.release()
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk was paused.',
                command=communication.MANAGER_START
            )
        if self._state.is_running():
            self._state.release()
            return communication.Response(
                success=False,
                message='Attempted to start when TreeWalk is running.',
                command=communication.MANAGER_START
            )

        self._state.set_preparing(config)
        # Prepare the data
        data = prepare(config)
        tree_walk_id, num_workers, work_packages = data
        # Create the worker processes and start them
        for id_worker in range(num_workers):
            input_data_queue = multiprocessing.Queue()
            for package in work_packages[id_worker]:
                input_data_queue.put(package)
            input_command_queue = multiprocessing.Queue()
            worker = treewalk.Worker(
                identifier=id_worker,
                input_data_queue=input_data_queue,
                input_command_queue=input_command_queue,
                config=config,
                connection_data=self._connection_data,
                tree_walk_id=tree_walk_id,
                lock=self._worker_lock,
                counter=self._worker_counter,
                num_workers=self._num_workers,
                work_packages_done=self._work_packages_done,
                db_thread_input_queue_data=communication.database_thread_files_input_data,
                db_thread_input_queue_commands=communication.database_thread_files_input_commands,
                measure_time=self._measure_time
            )
            self._workers.append(
                (worker, input_data_queue, input_command_queue)
            )
        wakeup_command = communication.Command(
            command=communication.DATABASE_THREAD_WAKEUP, data=None
        )
        communication.database_thread_files_input_commands.put(wakeup_command)
        communication.database_thread_metadata_input_commands.put(wakeup_command)
        for worker, _, _ in self._workers:
            worker.start()
        # Update the manager
        self._config = config
        self._roots = config.get_directories()
        self._num_workers.value = num_workers
        self._work_packages_total = sum(
            [len(worker_list) for worker_list in work_packages
        ])
        self._tree_walk_id = tree_walk_id
        self._state.set_running(config)
        self._state.set_running_workers(self._num_workers.value)
        self._state.release()
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
            command=communication.MANAGER_START
        )
