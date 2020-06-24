"""Implementation of the scheduler thread.

This thread is responsible for keeping the schedule up-to-date, removing
processes one-time entries and dispatching configurations to the manager.
"""


# Python imports
import queue
import logging
import datetime
import threading


# Local imports
from . import utils
from . import database
from . import responses
from . import task as task_module
import crawler.treewalk as treewalk
import crawler.treewalk.manager as manager
from crawler.services.config import Config
import crawler.communication as communication


_logger = logging.getLogger(__name__)


class TreeWalkScheduler(threading.Thread):

    def __init__(self, db_info: dict, measure_time: bool, update_interval: int):
        super(TreeWalkScheduler, self).__init__()
        self._db_connection = database.SchedulerDatabaseConnection(
            db_info=db_info,
            measure_time=measure_time
        )
        self._update_interval = update_interval

    def _do_command(self, command: communication.Command) -> None:
        """Execute a command.

        Args:
            command (communication.Command): command to run

        """

        def add_config() -> None:
            """Helper method: add config"""
            config = command.data # type: Config
            interval = config.get_interval()
            identifier = config.get_identifier()
            identifiers_present = self._db_connection.get_identifiers()
            if identifier in identifiers_present:
                responses.respond_config_already_present(identifier)
                return
            if self._db_connection.insert(config):
                responses.respond_config_inserted(
                    identifier=identifier, success=True
                )
            else:
                responses.respond_config_inserted(
                    identifier=identifier, success=False
                )

        def remove_config() -> None:
            """Helper method: remove config"""
            identifier = command.data
            if self._db_connection.remove(identifier):
                responses.respond_config_deleted(
                    identifier=identifier, success=True
                )
            else:
                responses.respond_config_deleted(
                    identifier=identifier, success=False
                )

        def get_schedule() -> None:
            """Helper method: get schedule"""
            schedule = self._db_connection.get_schedule(as_json=True)
            responses.respond_schedule(schedule)


        functions = {
            communication.SCHEDULER_ADD_CONFIG: [add_config, self._update],
            communication.SCHEDULER_REMOVE_CONFIG: [remove_config, self._update],
            communication.SCHEDULER_GET_SCHEDULE: [get_schedule],
        }
        for func in functions.get(command.command):
            func()

    def _update(self) -> None:
        """Update the schedule in the database."""
        schedule = self._db_connection.get_schedule(as_json=False)
        for task in schedule:
            utils.update_task(task)
        self._db_connection.update_schedule(
            tasks=[task for task in schedule if task.update_in_schedule]
        )

    def _dispatch(self, task: task_module.Task) -> None:
        """Dispatch the config to the manager.

        Dispatch the config to the manager and update the entry in the schedule.
        It gets removed if it is a one-time task, otherwise the timestamp of
        the next execution is updated.

        Args:
            task (task_module.Task): task to dispatch

        """
        _logger.info('TWS dispatching executio to TWM.')
        config = Config(task.config)
        response = manager.start(config)
        if not response.success:
            return
        timestamp_next_new, pending_new = utils.get_timestamp_next_and_pending(
            timestamp_last=task.timestamp_next,
            interval=task.interval
        )
        if task.interval <= 0:
            self._db_connection.remove(identifier=task.identifier)
        else:
            print(
                f'Set TS from {task.timestamp_next} to {timestamp_next_new} '
                f'and pending from {task.pending} to {pending_new}.'
            )
            self._db_connection.update(
                identifier=task.identifier,
                timestamp_next=timestamp_next_new,
                pending=pending_new
            )

    def run(self) -> None:
        """Run the scheduler thread."""
        _logger.info('Running TreeWalk Scheduler (TWS).')
        while True:
            try:
                _logger.info('TWS waiting for command.')
                command = communication.scheduler_queue_input.get(
                    block=True,
                    timeout=self._update_interval
                )
                if command.command == communication.SCHEDULER_SHUTDOWN:
                    break
                self._do_command(command)
            except queue.Empty:
                pass
            finally:
                _logger.info('TWS updating schedule.')
                self._update()
            task = self._db_connection.get_next_task()
            if task is None:
                continue
            _logger.info('TWS retrieved a task to dispatch.')
            self._dispatch(task)
