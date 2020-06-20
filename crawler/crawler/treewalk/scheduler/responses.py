"""This module contains the responses coming from the scheduler."""


# Local imports
import crawler.communication as communication


def respond_config_already_present(identifier: str) -> None:
    """Respond that the config is already present in the schedule.

    This function creates a corresponding response object and inserts it
    in the scheduler output queue.

    Args:
        identifier (str): identifier of the configuration

    """
    response = communication.Response(
        success=False,
        message=(
            f'Configuration with identifier {identifier} '
            f'is already present in the schedule, thus it was not added.'
        ),
        command=communication.SCHEDULER_ADD_CONFIG
    )
    communication.scheduler_queue_output.put(response)


def respond_config_inserted(identifier: str, success: bool) -> None:
    """Respond that the config was inserted in the database.

    This function creates a corresponding response object and inserts it
    in the scheduler output queue.
    The response depends if the insertion succeeded or failed.

    Args:
        identifier (str): identifier of the configuration
        success (bool): insertion succeeded/failed

    """
    if success:
        response = communication.Response(
            success=True,
            message=(
                f'Configuration with identifier {identifier} '
                f'was successfully added to the schedule.'
            ),
            command=communication.SCHEDULER_ADD_CONFIG
        )
    else:
        response = communication.Response(
            success=False,
            message=(
                f'Configuration with identifier {identifier} '
                f'wasn\'t added to the schedule due to an internal error.'
            ),
            command=communication.SCHEDULER_ADD_CONFIG
        )
    communication.scheduler_queue_output.put(response)


def respond_config_deleted(identifier: str, success: bool) -> None:
    """Respond that the config was deleted from the database.

    This function creates a corresponding response object and inserts it
    in the scheduler output queue.
    The response depends if the deletion succeeded or failed.

    Args:
        identifier (str): identifier of the configuration
        success (bool): insertion succeeded/failed

    """
    if success:
        response = communication.Response(
            success=True,
            message=(
                f'Configuration with identifier {identifier} '
                f'was successfully deleted from the schedule.'
            ),
            command=communication.SCHEDULER_REMOVE_CONFIG
        )
    else:
        response = communication.Response(
            success=False,
            message=(
                f'Configuration with identifier {identifier} '
                f'wasn\'t deleted from the schedule (not present).'
            ),
            command=communication.SCHEDULER_REMOVE_CONFIG
        )
    communication.scheduler_queue_output.put(response)


def respond_schedule(schedule: dict) -> None:
    """Respond the TreeWalk schedule.

    This function creates a corresponding response object and inserts it
    in the scheduler output queue.
    The response depends if the insertion succeeded or failed.

    Args:
        schedule (dict): schedule

    """
    if schedule is None:
        response = communication.Response(
            success=False,
            message='Unable to read schedule.',
            command=communication.SCHEDULER_GET_SCHEDULE
        )
    else:
        response = communication.Response(
            success=True,
            message=schedule,
            command=communication.SCHEDULER_GET_SCHEDULE
        )
    communication.scheduler_queue_output.put(response)
