"""Basic server implementation for REST API interface.

This module contains the REST interface for communication with the crawler.

FIXME: Check the error codes and update them.
"""


# Python imports
import json
import logging


# 3rd party imports
import flask


# Local imports
from . import defaults
from . import parsing
import crawler.treewalk as treewalk
import crawler.services.config as config_service
import crawler.services.environment as environment


app = flask.Flask(
    __name__,
    template_folder='../../templates',
    static_folder='../../static'
)

_logger_werkzeug = logging.getLogger('werkzeug')
_logger_werkzeug.setLevel(logging.ERROR)


def _get_response(
        status_ok: bool,
        message: str,
        command: str,
        error_code: int
) -> flask.Response:
    """[summary]

    Args:
        status_ok (bool): [description]
        message (str): [description]
        command (str): [description]
        error_code (int): [description]

    Returns:
        flask.Response: [description]
    """
    if status_ok:
        data = {'message': message}
        resp = flask.Response(
            json.dumps(data),
            status=defaults.STATUS_OK,
            mimetype=defaults.MIMETYPE_JSON
        )
        return resp
    data = {'error': message}
    resp = flask.Response(
        json.dumps(data),
        status=error_code,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/pause', methods=['GET', 'POST'])
def pause() -> flask.Response:
    """API endpoint to pause the current crawler execution.

    Pausing the current crawler execution.
    The execution can be continued later on.
    On success, the response status 200 is set.
    On Failure (server), the internal server error 500 is set.
    If the crawler isn't running, the response status 409 is set.

    Returns:
        flask.Response: HTTP response

    """
    status_ok, message, command = treewalk.pause()
    return _get_response(
        status_ok=status_ok,
        message=message,
        command=command,
        error_code=defaults.STATUS_CONFLICT
    )


@app.route('/continue', methods=['GET', 'POST'])
def unpause() -> flask.Response:
    """API endpoint to continue a paused execution of the crawler.

    Continuing a paused execution of the crawler.
    On success, the response status 200 is set.
    On Failure, the internal server error 500 is set.
    If the crawler isn't paused, the response status 409 is set.

    Returns:
        flask.Response: HTTP response

    """
    status_ok, message, command = treewalk.unpause()
    return _get_response(
        status_ok=status_ok,
        message=message,
        command=command,
        error_code=defaults.STATUS_CONFLICT
    )



@app.route('/stop', methods=['GET', 'POST'])
def stop() -> flask.Response:
    """API endpoint to stop the current execution of the crawler.

    Stopping the current execution of the crawler.
    On success, the response status 200 is set.
    On Failure, the internal server error 500 is set.

    Returns:
        flask.Response: HTTP response

    """
    status_ok, message, command = treewalk.stop()
    return _get_response(
        status_ok=status_ok,
        message=message,
        command=command,
        error_code=defaults.STATUS_INTERNAL_SERVER_ERROR
    )


@app.route('/info', methods=['GET'])
def info() -> flask.Response:
    """API endpoint to retrive information about the current status.

    Return a description of the current status, e.g in which state the crawler
    is, which config is used, etc.

    Returns:
        flask.Response: HTTP response

    """
    status_ok, data, command = treewalk.info()
    return _get_response(
        status_ok=status_ok,
        message=data,
        command=command,
        error_code=defaults.STATUS_INTERNAL_SERVER_ERROR
    )


@app.route('/start', methods=['GET', 'POST'])
def start() -> flask.Response:
    """API endpoint to retrive start the crawler with a certain configuration.

    Starting the crawler with a arbitrary configuration.
    If the config/request is invalid, status code 400 is set.
    On success, the status code 200 is set.

    Returns:
        flask.Response: HTTP response

    """
    config = flask.request.args.get('config')
    if config is None:
        msg = {'info': 'Provide config or filepath via ?config=<your-config>'}
        resp = flask.Response(
            json.dumps(msg),
            status=defaults.STATUS_BAD_REQUEST,
            mimetype=defaults.MIMETYPE_JSON
        )
        return resp
    parser = config_service.ConfigParser(config)
    try:
        config = parser.parse()
    except config_service.ConfigParsingException as error:
        msg = {'error': str(error)}
        resp = flask.Response(
            json.dumps(msg),
            status=defaults.STATUS_BAD_REQUEST,
            mimetype=defaults.MIMETYPE_JSON
        )
        return resp
    update = flask.request.args.get('update', '').lower()
    if update == 'true':
        update = True
    else:
        update = False
    status_ok, message, command = treewalk.start(config, update)
    return _get_response(
        status_ok=status_ok,
        message=message,
        command=command,
        error_code=defaults.STATUS_INTERNAL_SERVER_ERROR
    )


@app.route('/config', methods=['GET', 'POST'])
def config():
    if flask.request.method == 'GET':
        return flask.render_template('config.html')
    try:
        result, update = parsing.parse(flask.request.form)
    except parsing.APIParsingException as err:
        message = f'Failed. {str(err)}'
        return flask.render_template('config.html', message=message)
    parser = config_service.ConfigParser(json.dumps(result))
    try:
        config = parser.parse()
    except config_service.ConfigParsingException as error:
        return flask.render_template('config.html', message=str(error))
    status_ok, message, command = treewalk.start(config, update)
    if status_ok:
        return flask.render_template('config.html', message='Success')
    return flask.render_template('config.html', message=message)


@app.route('/shutdown', methods=['GET', 'POST'])
def shutdown():
    # FIXME: Get response from interface and evaluate
    treewalk.shutdown()
    func = flask.request.environ.get('werkzeug.server.shutdown')
    if func is None:
        # TODO handle error
        return None
    func()
    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


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
