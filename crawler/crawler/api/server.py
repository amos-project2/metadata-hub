"""Basic server implementation for REST API interface.

This module contains the REST interface for communication with the crawler.
"""


# Python imports
import json
import threading


# 3rd party modules
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


@app.route('/pause', methods=['POST'])
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

    # TODO: pause functionality

    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/continue', methods=['POST'])
def unpause() -> flask.Response:
    """API endpoint to continue a paused execution of the crawler.

    Continuing a paused execution of the crawler.
    On success, the response status 200 is set.
    On Failure, the internal server error 500 is set.
    If the crawler isn't paused, the response status 409 is set.

    Returns:
        flask.Response: HTTP response

    """

    # TODO: unpause functionality

    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/stop', methods=['POST'])
def stop() -> flask.Response:
    """API endpoint to stop the current execution of the crawler.

    Stopping the current execution of the crawler.
    On success, the response status 200 is set.
    On Failure, the internal server error 500 is set.
    If the crawler isn't running, the response status 409 is set.

    Returns:
        flask.Response: HTTP response

    """

    # TODO: activate pause mechanism here and return success/error

    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/info', methods=['GET'])
def info() -> flask.Response:
    """API endpoint to retrive information about the current status.

    Return a description of the current status, e.g in which state the crawler
    is, which config is used, etc.

    Returns:
        flask.Response: HTTP response

    """

    # TODO: info functionality

    msg = {
        'message': {
            'status': 'Not running',
            'config': {},
            'progress': f'{0.0} %'
        }
    }
    resp = flask.Response(
        json.dumps(msg),
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/start', methods=['POST'])
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
    treewalk.add_config_queue(config)
    resp = flask.Response(
        status=defaults.STATUS_OK,
        mimetype=defaults.MIMETYPE_JSON
    )
    return resp


@app.route('/config', methods=['GET', 'POST'])
def config():
    if flask.request.method == 'GET':
        return flask.render_template('config.html')
    try:
        result = parsing.parse(flask.request.form)
    except parsing.APIParsingException as err:
        message = f'Failed. {str(err)}'
        return flask.render_template('config.html', message=message)
    parser = config_service.ConfigParser(json.dumps(result))
    try:
        config = parser.parse()
    except config_service.ConfigParsingException as error:
        return flask.render_template('config.html', message=str(error))
    treewalk.add_config_queue(config)
    return flask.render_template('config.html', message='Success')


@app.route('/shutdown', methods=['POST'])
def shutdown():
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
