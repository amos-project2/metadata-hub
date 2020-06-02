"""Manager of the TreeWalk.

The manager handles the worker processes.

TODO: Add more detailed description
"""

# Python imports
from datetime import datetime
import logging
import json
from multiprocessing import Queue

# Local imports
from . import tree_walk as tree_walk
import crawler.services.environment as environment
from crawler.treewalk.state import State
from crawler.services.config import Config
from crawler.treewalk.worker import Worker
from crawler.treewalk.state import StateException
from crawler.connectPG.connector import DatabaseConnection

from ..services import tracing

_logger = logging.getLogger(__name__)


class TreeWalkManager:

    RESPONSE_OK = 'OK'

    COMMAND_INFO = 'info'
    COMMAND_STOP = 'stop'
    COMMAND_START = 'start'
    COMMAND_PAUSE = 'pause'
    COMMAND_UNPAUSE = 'unpause'
    COMMAND_SHUTDOWN = 'shutdown'


    def __init__(self):
        self._workers = []
        self._state = State()
        self._total = 0


    def start(self, config: Config) -> str:
        """Start the TreeWalk with given config.

        The TreeWalk can only be started when the current state is READY.

        Args:
            config (Config): configuration of current execution

        Returns:
            str: RESPONSE_OK on success, error message otherwise

        """
        if self._state.is_paused():
            message = 'Attempted to start when state was paused.'
            _logger.warning(message)
            return message
        # There is currently no way for the processes to report that they
        # are finished, so individually check them (the status is running)
        # in this case
        for worker in self._workers:
            try:
                if worker.exitcode is None:
                    _logger.debug((
                        f'Attempted to start new TreeWalk but process with '
                        f'PID {worker.pid} is still running.'
                    ))
                    return 'Work is still in progress. Ignoring.'
            except ValueError:
                # Process terminated
                pass
        self._total = 0
        self._workers = []
        self._state.set_ready()

        # Initialize work packages and worker processes
        number_of_workers = tree_walk.get_number_of_workers(
            config.get_options_power_level()
        )


        TRACER = tracing.Tracer(config._data)
        alreadyProcessed = TRACER.get_processed_nodes()

        work_packages, split = tree_walk.create_work_packages(
            inputs=config.get_paths_inputs(),
            work_package_size=config.get_options_package_size(),
            number_of_workers=number_of_workers,
            already_processed=alreadyProcessed
        )
        for element in split:
            work_packages[0].append([element])
        # Create the connection dictionary for the database
        connectionData = {
            'user': environment.env.DATABASE_USER,
            'password': environment.env.DATABASE_PASSWORD,
            'host': environment.env.DATABASE_HOST,
            'port': environment.env.DATABASE_PORT,
            'dbname': environment.env.DATABASE_NAME,
        }
        # Establish the connection
        dbConnectionPool = DatabaseConnection(connectionData, config.get_options_power_level())
        # Create input values for the database insert
        dir_path = ", ".join([inputs['path'] for inputs in config.get_paths_inputs()])
        crawl_config = json.dumps(config._data)
        analyzedDirectories = json.dumps({})
        # Write the initial entry into the database
        start = f"""INSERT INTO crawls (dir_path, name, status, crawl_config, analyzed_dirs, starting_time)
                    VALUES('{dir_path}', '---', 'Running', '{crawl_config}', '{analyzedDirectories}', '{datetime.now()}')
                    RETURNING id"""
        dbID = dbConnectionPool.insert_new_record(start)

        for id_worker in range(number_of_workers):
            queue = Queue()
            command_queue = Queue()
            for index, package in enumerate(work_packages[id_worker]):
                self._total += 1
                queue.put(package)
            worker = Worker(
                work_packages=queue,
                command_queue=command_queue,
                config=config,
                connectionInfo=connectionData,
                #db_connection=dbConnectionPool,
                tree_walk_id=dbID
            )
            self._workers.append(worker)

        for worker in self._workers:
            worker.start()
        self._state.set_running(config)
        return TreeWalkManager.RESPONSE_OK


    def pause(self) -> str:
        """Pause the current execution of the TreeWalk.

        The TreeWalk can only be paused if the current state is RUNNING.

        Returns:
            str: RESPONSE_OK on success, error message otherwise

        """
        try:
            self._state.set_paused()
        except StateException as err:
            _logger.warning(f'TreeWalkManager: {str(err)}')
            return str(err)
        for worker in self._workers:
            worker.command_queue.put(Worker.COMMAND_PAUSE)
        return TreeWalkManager.RESPONSE_OK


    def unpause(self) -> str:
        """Continue the paused execution.

        The TreeWalk can only be unpaused if the current state is PAUSED.

        Returns:
            str: RESPONSE_OK on success, error message otherwise

        """
        try:
            self._state.set_unpaused()
        except StateException as err:
            _logger.warning(f'TreeWalkManager: {str(err)}')
            return str(err)
        for worker in self._workers:
            worker.command_queue.put(Worker.COMMAND_UNPAUSE)
        return TreeWalkManager.RESPONSE_OK


    def stop(self) -> str:
        """Stop the current execution of the TreeWalk.

        The TreeWalk can be stopped in every state.

        Returns:
            str: RESPONSE_OK on success, error message otherwise

        """
        if self._state.is_ready():
            _logger.warning(f'TreeWalkManager: already ready, ignoring stopping.')
            return 'Already ready. Ignoring.'
        for worker in self._workers:
            worker.command_queue.put(Worker.COMMAND_STOP, False)
            worker.join()
        self._state.set_ready()
        return TreeWalkManager.RESPONSE_OK


    def info(self) -> dict:
        """Get information about the current state of the TreeWalk.

        Returns:
            dict: info message for JSON

        """
        if not self._state.is_running():
            return {
                'status': self._state.get_status(),
                'config': self._state.get_config()
            }
        packages_left = 0
        for worker in self._workers:
            packages_left += worker.work_packages.qsize()
        if packages_left == 0:
            progress = 100.0
        else:
            progress = ((self._total - packages_left) / self._total) * 100.0
        return {
            'status': self._state.get_status(),
            'config': self._state.get_config(),
            'progress': f'{progress:.2f}'
        }
