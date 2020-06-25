"""Basic server implementation for REST API interface.

This module contains the REST interface for communication with the crawler.
Each response will have the HTTP status code set to 200, the actual status
is set in the REST response.
"""


# Python imports
import json
import logging


# 3rd party imports
import flask


# Local imports
from . import defaults
import crawler.treewalk.manager as manager
import crawler.treewalk.scheduler as scheduler
import crawler.treewalk.db_updater as db_updater
import crawler.services.config as config_service
import crawler.services.intervals as interval_pkg
import crawler.services.environment as environment
import crawler.communication as communication


app = flask.Flask(__name__)

_logger_werkzeug = logging.getLogger('werkzeug')
_logger_werkzeug.setLevel(logging.ERROR)


def _get_response(response: communication.Response) -> flask.Response:
    """Helper method to send a response.

    Args:
        response (communication.Response): response object

    Returns:
        flask.Response: REST response
    """
    data = {
        'success': response.success,
        'message': response.message,
        'command': response.command
    }
    resp = flask.Response(
        json.dumps(data),
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/pause', methods=['GET', 'POST'])
def pause() -> flask.Response:
    """API endpoint to pause the current crawler execution.

    Pausing the current crawler execution.
    The execution can be continued later on.

    Returns:
        flask.Response: REST response

    """
    response = manager.pause()
    return _get_response(response)


@app.route('/continue', methods=['GET', 'POST'])
def unpause() -> flask.Response:
    """API endpoint to continue a paused execution of the crawler.

    Continuing a paused execution of the crawler.

    Returns:
        flask.Response: REST response

    """
    response = manager.unpause()
    return _get_response(response)


@app.route('/stop', methods=['GET', 'POST'])
def stop() -> flask.Response:
    """API endpoint to stop the current execution of the crawler.

    Stopping the current execution of the crawler.

    Returns:
        flask.Response: REST response

    """
    response = manager.stop()
    return _get_response(response)


@app.route('/info', methods=['GET'])
def info() -> flask.Response:
    """API endpoint to retrive information about the current status.

    Return a description of the current status, e.g in which state the crawler
    is, which config is used, etc.

    Returns:
        flask.Response: REST response

    """
    response = manager.info()
    return _get_response(response)


@app.route('/start', methods=['GET', 'POST'])
def start() -> flask.Response:
    """API endpoint to retrive start the crawler with a certain configuration.

    Starting the crawler with a arbitrary configuration.

    Returns:
        flask.Response: REST response

    """
    config = flask.request.args.get('config')
    if config is None:
        response = communication.Response(
            success=False,
            message='Provide config or filepath via ?config=<your-config>',
            command=communication.MANAGER_START,
        )
        return _get_response(response)
    parser = config_service.ConfigParser(config)
    try:
        config = parser.parse()
    except config_service.ConfigParsingException as error:
        response = communication.Response(
            success=False,
            message=str(error),
            command=communication.MANAGER_START
        )
        return _get_response(response)
    response = scheduler.add_config(config)
    return _get_response(response)


@app.route('/schedule/list', methods=['GET', 'POST'])
def schedule() -> flask.Response:
    """Return the TreeWalk schedule.

    Returns:
        flask.Response: REST response

    """
    response = scheduler.get_schedule()
    return _get_response(response)


@app.route('/schedule/remove', methods=['GET', 'POST'])
def schedule_remove() -> flask.Response:
    """Return the TreeWalk schedule.

    Returns:
        flask.Response: REST response

    """
    identifier = flask.request.args.get('id', '')
    response = scheduler.remove_config(identifier)
    return _get_response(response)


@app.route('/shutdown', methods=['GET', 'POST'])
def shutdown():
    manager.shutdown()
    db_updater.shutdown()
    scheduler.shutdown()
    func = flask.request.environ.get('werkzeug.server.shutdown')
    if func is None:
        # TODO handle error
        return None
    func()
    response = communication.Response(
        success=True,
        message='Shutting down. Bye!',
        command=communication.MANAGER_SHUTDOWN
    )
    return _get_response(response)


@app.route('/intervals/add', methods=['GET', 'POST'])
def add_interval() -> flask.Response:
    """API endpoint to add intervals for maximum resource consumption.

    Returns:
        flask.Response: REST response

    """
    start = flask.request.args.get('start')
    end = flask.request.args.get('end')
    cpu = flask.request.args.get('cpu')
    if (start is None) or (end is None) or (cpu is None):
        response = communication.Response(
            success=False,
            message='Please provide a start/end time and a cpu level.',
            command=communication.SCHEDULER_ADD_INTERVAL,
        )
        return _get_response(response)
    if not interval_pkg.TimeInterval.assert_valid(start_str=start, end_str=end):
        response = communication.Response(
            success=False,
            message='Invalid start/end times.',
            command=communication.SCHEDULER_ADD_INTERVAL,
        )
        return _get_response(response)
    interval = interval_pkg.TimeInterval(
        start_str=start, end_str=end, cpu_level=cpu
    )
    response = scheduler.add_interval(interval)
    return _get_response(response)


@app.route('/intervals/remove', methods=['GET', 'POST'])
def intervals_remove() -> flask.Response:
    """API endpoint to remove and interval with a certain ID.

    Returns:
        flask.Response: REST response

    """
    identifier = flask.request.args.get('id', '')
    response = scheduler.remove_interval(identifier)
    return _get_response(response)


@app.route('/intervals/list', methods=['GET', 'POST'])
def intervals() -> flask.Response:
    """API endpoint to list all intervals for maximum resource consumption.

    Returns:
        flask.Response: REST response

    """
    response = scheduler.get_intervals()
    return _get_response(response)


@app.route('/', methods=['GET'])
def home():
    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


def start() -> None:
    """Start the Flask application."""
    app.run(
        host=environment.env.CRAWLER_HOST,
        port=environment.env.CRAWLER_PORT
    )
