"""Helper module for the scheduler"""


# Python imports
import datetime
from typing import Tuple, List
from . import task as task_module


def get_timestamp_next_and_pending(
        timestamp_last: datetime.datetime,
        interval: int
) -> Tuple[datetime.datetime, bool]:
    """Compute and return the new exec timestamp and pending status.

    This function is only called when the task in fact got dispatched, so the
    pending status is statically set to False for now.

    Args:
        timestamp_last (datetime.datetime): last timestamp_next
        interval (int): interval of task

    Returns:
        Tuple[datetime.datetime, bool]: (new timestamp_next, pending status)

    """
    timestamp_now = datetime.datetime.now()
    delta = datetime.timedelta(seconds=interval)
    timestamp_new = max(timestamp_last + delta, timestamp_now + delta)
    return (timestamp_new, False)


def update_task(task: task_module.Task) -> None:
    """Update a task object.

    Updates the pending status and if it should be updated in the database.

    Args:
        task (task_module.Task): task

    """
    timestamp_now = datetime.datetime.now()
    if task.timestamp_next < timestamp_now:
        task.update_in_schedule = True
        task.pending = True


def get_next_task(tasks: List[task_module.Task]) -> task_module.Task:
    """Return the next task to execute.

    If no task is pending, return None. Otherwise, compare the execution
    timestamps of every task and return the oldest one.

    Args:
        tasks (List[task_module.Task]): list of pending tasks

    Returns:
        task_module.Task: Task to execute or None
    """
    if not tasks:
        return None
    if len(tasks) == 1:
        return tasks.pop()
    best_index = 0
    best_timestamp = tasks[0].timestamp_next
    for index, task in enumerate(tasks):
        if task.timestamp_next < best_timestamp:
            best_index = index
            best_timestamp = task.timestamp_next
    return tasks[best_index]
