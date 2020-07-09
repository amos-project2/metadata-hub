"""The TreeWalkManager manages the worker processes.

TODO: Add description
"""


# Python imports
import os
import json
import time
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

    def __init__(
            self,
            db_info: dict,
            measure_time: bool,
            state: treewalk.State,
            event_db_thread_files: threading.Event,
            event_db_thread_files_manager: threading.Event,
            event_db_thread_metadata: threading.Event,
            event_db_thread_metadata_manager: threading.Event
    ):
        super(TreeWalkManager, self).__init__()
        # Shared ressources with worker processes
        self._finished = multiprocessing.Event() # type: multiprocessing.Event
        self._worker_lock = multiprocessing.Lock()
        self._num_workers = multiprocessing.Value('i', 0)
        self._worker_counter = multiprocessing.Value('i', 0)
        self._work_packages_done = multiprocessing.Value('i', 0)
        # TreeWalk auxiliary data
        self._roots = []
        self._workers = [] # # type: List[WorkerControl]
        self._tree_walk_id = -1
        self._work_packages_total = 0
        self._state = state # type: treewalk.State
        self._connection_data = db_info
        self._measure_time = measure_time
        self._time_start = 0
        self._config = None # type: Config
        # Events for controlling the DB Threads
        self._event_db_thread_files = event_db_thread_files
        self._event_db_thread_files_manager = event_db_thread_files_manager
        self._event_db_thread_metadata = event_db_thread_metadata
        self._event_db_thread_metadata_manager = event_db_thread_metadata_manager
        # Database connection
        self._db_connection = database.DatabaseConnection(
            db_info=self._connection_data,
            measure_time=self._measure_time
        )
        # Function callbacks for commands
        self._functions = {
            communication.MANAGER_PAUSE: self._treewalk_pause,
            communication.MANAGER_SHUTDOWN: self._treewalk_shutdown,
            communication.MANAGER_START: self._treewalk_start,
            communication.MANAGER_STOP: self._treewalk_stop,
            communication.MANAGER_UNPAUSE: self._treewalk_unpause
        }
        self._shutdown = False

    # FIXME acknowledge workers to stop
    def _reset(self) -> None:
        """Reset the TreeWalkManager."""
        self._roots = []
        self._workers = []
        self._num_workers.value = 0
        self._worker_counter.value = 0
        self._work_packages = []
        self._work_packages_split = []
        self._tree_walk_id = -1
        self._total = 0
        self._state.set_progress(0.0)
        self._state.set_ready()
        self._time_start = 0
        self._config = None
        self._treewalk_db_threads_sleep()

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
        # FIXME DO NOT USE YET
        _logger.info('TWManager: updating number of workers.')
        self._treewalk_pause(None)
        _logger.info('TWManager: stopped successfully.')
        work_packages = []
        for worker_control in self._workers:
            try:
                item = worker_control.data_queue.get(block=False)
                work_packages.append(item)
            except queue.Empty:
                continue
        _logger.info('TWManager: got all remaining work packages.')
        work_packages = treewalk.resize_work_packages(
            work_packages=work_packages,
            num_workers=num_workers
        )
        print(len(work_packages))
        _logger.info('TWManager: shuffled new work packages.')
        self._num_workers.value = num_workers
        self._state.set_running_workers(num_workers)
        if reduce:
            diff = self._num_workers.value - num_workers
            command = communication.Command(
                command=communication.WORKER_STOP, data=None
            )
            for worker_id in range(diff):
                worker_control = self._workers.pop()
                worker_control.command_queue.put(command)
                worker_control.event_self.wait(timeout=1)
                worker_control.event_self.clear()
                worker_control.event_manager.set()
                worker_control.me.terminate()
                while worker_control.me.is_alive():
                    pass
                worker_control.me.close()
            _logger.info(f'TWManager: stopped {diff} workers.')
            print(len(self._workers))
            for worker_control in self._workers:
                print("ABC")
                new_work_packages = work_packages.pop()
                while new_work_packages:
                    item = new_work_packages.pop()
                    worker_control.data_queue.put(item)
            self._treewalk_unpause(None)
        else:
            diff = num_workers - self._num_workers.value
            curr_workers = len(self._workers)
            for worker_control in self._workers:
                new_work_packages = work_packages.pop()
                while new_work_packages:
                    item = new_work_packages.pop()
                    worker_control.data_queue.put(item)
            self._treewalk_unpause(None)
            for id_worker in range(diff):
                identifier = diff + curr_workers
                input_data_queue = multiprocessing.Queue()
                new_work_packages = work_packages.pop()
                while new_work_packages:
                    item = new_work_packages.pop()
                    input.data_queue.put(item)
                input_command_queue = multiprocessing.Queue()
                event_self, event_manager = communication.get_worker_events()
                worker = treewalk.Worker(
                    identifier=id_worker,
                    input_data_queue=input_data_queue,
                    input_command_queue=input_command_queue,
                    config=self._config,
                    tree_walk_id=self._tree_walk_id,
                    lock=self._worker_lock,
                    counter=self._worker_counter,
                    num_workers=self._num_workers,
                    work_packages_done=self._work_packages_done,
                    db_thread_input_queue_data=communication.database_thread_files_input_data,
                    measure_time=self._measure_time,
                    event_self=event_self,
                    event_manager=event_manager
                )
                worker_control = WorkerControl(
                    identifier=identifier,
                    worker=worker,
                    input_data_queue=input_data_queue,
                    input_command_queue=input_command_queue,
                    event_self=event_self,
                    event_manager=event_manager
                )
                worker.start()
                self._workers.append(worker_control)
                _logger.info(f'TWManager: added {diff} workers.')


    def exec(self, command: communication.Command) -> None:
        _logger.info(f'TWManager: running command {command.command}')
        try:
            func = self._functions[command.command]
        except KeyError:
            _logger.error(f'Manager recevied unknown command {command.command}')
            return
        response = func(command.data)
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
        # Set the database threads to sleep at startup
        self._treewalk_db_threads_sleep()
        while True:
            check = False
            if self._state.is_running():
                self.check_and_update_worker()
                self._update_progress()
                self._state.lock()
                if self._state.is_finished():
                    self._treewalk_finish()
                self._state.release()
                try:
                    command = communication.manager_queue_input.get(
                        block=True, timeout=1
                    )
                except queue.Empty:
                    continue
                self.exec(command)
            else:
                command = communication.manager_queue_input.get()
                self.exec(command)
            if self._shutdown:
                break
        _logger.info('Goodbye TWManager.')


    def _treewalk_db_threads_wakeup(self) -> None:
        """Wakeup database threads."""
        wakeup_command = communication.Command(
            command=communication.DATABASE_THREAD_WAKEUP, data=None
        )
        communication.database_thread_files_input_commands.put(wakeup_command)
        communication.database_thread_metadata_input_commands.put(wakeup_command)
        _logger.info('TWManager: successfully woke up threads.')


    def _treewalk_db_threads_sleep(self) -> None:
        """Set database threads to sleep to prevent command polling."""
        sleep_command = communication.Command(
            command=communication.DATABASE_THREAD_SLEEP, data=None
        )
        communication.database_thread_files_input_commands.put(sleep_command)
        communication.database_thread_metadata_input_commands.put(sleep_command)
        _logger.info('TWManager: waiting for threads to check sleep.')
        self._event_db_thread_files.wait()
        self._event_db_thread_metadata.wait()
        self._event_db_thread_files.clear()
        self._event_db_thread_metadata.clear()
        _logger.info('TWManager: successfully set threads to sleep.')


    def _treewalk_finish(self) -> None:
        """Finish a TreeWalk execution.

        This method should only be called when the state is locked and
        the TW state is finished.

        Delete files that are persisted in the database, but have been deleted
        in the file system. Remove the data from the database and set the crawl
        state to finished. Finally reset the TreeWalk (exit worker processes)
        and reset auxiliary data.

        """
        _logger.info('TWManager: Finished execution.')
        self._db_connection.delete_lost(
            crawlId=self._tree_walk_id, roots=self._roots
        )
        self._db_connection.set_crawl_state(
            tree_walk_id=self._tree_walk_id,
            status=communication.CRAWL_STATUS_FINISHED
        )
        for worker_control in self._workers:
            worker_control.event_manager.set()
        self._log_execution_time()
        self._reset()


    def _treewalk_shutdown(self, data: Any) -> communication.Response:
        """Stop the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        self._treewalk_stop(data)
        _logger.info('TWManager (terminate): succesfully stopped.')
        command = communication.Command(
            command=communication.DATABASE_THREAD_SHUTDOWN,
            data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        _logger.info('TWManager: terminated')
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
        # Check if state is valid.
        if self._state.is_ready():
            response.message = 'Attempted to stop when TreeWalk was ready.'
            self._state.release()
            return response
        if self._state.is_finished():
            response.message = (
                'TreeWalk finished in the meantime. Execution will be finished.'
            )
            self._treewalk_finish()
            self._state.release()
            return response
        # Stopping the TreeWalk execution
        command = communication.Command(
            command=communication.WORKER_STOP, data=None
        )

        for worker_control in self._workers:
            worker_control.command_queue.put(command)
        for worker_control in self._workers:
            worker_control.event_self.wait(timeout=1) # It can be that the worker already fininshed and was reseted by pause for example, so use timeout here
            worker_control.event_self.clear()
        _logger.info('TWManager (stop): started to stop workers.')
        command = communication.Command(
            command=communication.DATABASE_THREAD_STOP, data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        self._event_db_thread_files.wait(timeout=1)
        self._event_db_thread_metadata.wait(timeout=1)
        self._event_db_thread_files.clear()
        self._event_db_thread_metadata.clear()
        _logger.info('TWManager (stop): all workers and threads stopped.')
        for worker_control in self._workers:
            clear_queue(worker_control.data_queue)
        _logger.info('TWManager (stop): cleared data queues.')
        clear_queue(communication.database_thread_files_input_data)
        for worker_control in self._workers:
            worker_control.event_manager.set()
        for worker_control in self._workers:
            worker_control.me.terminate()
            while worker_control.me.is_alive():
                pass
            worker_control.me.close()
        clear_queue(communication.database_thread_files_input_data)
        _logger.info(f'TWManager (stop): Terminated all workers.')
        self._event_db_thread_files_manager.set()
        self._event_db_thread_metadata_manager.set()
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
        except treewalk.StateException as err:
            self._state.release()
            return communication.Response(
                success=False,
                message=f'Attempted to continue. {str(err)}',
                command=communication.MANAGER_UNPAUSE
            )
        command = communication.Command(
            command=communication.WORKER_UNPAUSE, data=None
        )
        for worker_control in self._workers:
            worker_control.command_queue.put(command)
        command = communication.Command(
            command=communication.DATABASE_THREAD_CONTINUE, data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        _logger.info('TWManager: continued worker and threads.')
        self._db_connection.set_crawl_state(
            tree_walk_id=self._tree_walk_id,
            status=communication.CRAWL_STATUS_RUNNING
        )
        self._state.release()
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
            command=communication.MANAGER_UNPAUSE
        )


    def _treewalk_pause(self, data: Any) -> communication.Response:
        """Pause the current execution of the TreeWalk.

        Returns:
            communication.Response: response object

        """
        print("HIU")
        self._state.lock()
        print("HUHU")
        try:
            self._state.set_paused()
        except treewalk.StateException as err:
            self._state.release()
            return communication.Response(
                success=False,
                message=f'Attempted to pause. {str(err)}',
                command=communication.MANAGER_PAUSE
            )
        command = communication.Command(
            command=communication.WORKER_PAUSE, data=None
        )
        for worker_control in self._workers:
            worker_control.command_queue.put(command)
        for worker_control in self._workers:
            worker_control.event_self.wait(timeout=1)
            worker_control.event_self.clear()
        command = communication.Command(
            command=communication.DATABASE_THREAD_PAUSE, data=None
        )
        communication.database_thread_files_input_commands.put(command)
        communication.database_thread_metadata_input_commands.put(command)
        self._event_db_thread_files.wait(timeout=1)
        self._event_db_thread_metadata.wait(timeout=1)
        self._event_db_thread_files.clear()
        self._event_db_thread_metadata.clear()
        _logger.info('TWManager: paused worker and threads.')
        self._db_connection.set_crawl_state(
            tree_walk_id=self._tree_walk_id,
            status=communication.CRAWL_STATUS_PAUSED
        )
        self._state.release()
        return communication.Response(
            success=True,
            message=communication.MANAGER_OK,
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
        if self._state.is_finished():
            self._treewalk_finish()
            self._state.release()
            return communication.Response(
                success=False,
                message='TreeWalk finished in the meantime. Cleaned up.',
                command=communication.MANAGER_START
            )
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
            event_self, event_manager = communication.get_worker_events()
            worker = treewalk.Worker(
                identifier=id_worker,
                input_data_queue=input_data_queue,
                input_command_queue=input_command_queue,
                config=config,
                tree_walk_id=tree_walk_id,
                lock=self._worker_lock,
                counter=self._worker_counter,
                num_workers=self._num_workers,
                work_packages_done=self._work_packages_done,
                db_thread_input_queue_data=communication.database_thread_files_input_data,
                measure_time=self._measure_time,
                event_self=event_self,
                event_manager=event_manager
            )
            worker_control = WorkerControl(
                identifier=id_worker,
                worker=worker,
                input_data_queue=input_data_queue,
                input_command_queue=input_command_queue,
                event_self=event_self,
                event_manager=event_manager
            )
            self._workers.append(worker_control)
        self._treewalk_db_threads_wakeup()
        for worker_control in self._workers:
            worker_control.me.start()
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


class WorkerControl:

    def __init__(
        self,
        identifier: int,
        worker: multiprocessing.Process,
        input_data_queue: multiprocessing.Queue,
        input_command_queue: multiprocessing.Queue,
        event_self: multiprocessing.Event,
        event_manager: multiprocessing.Event
    ):
        self.identifier = identifier
        self.me = worker
        self.data_queue = input_data_queue
        self.command_queue = input_command_queue
        self.event_self = event_self
        self.event_manager = event_manager


def clear_queue(q: multiprocessing.Queue):
    while True:
        try:
            q.get(block=False)
        except queue.Empty:
            return
