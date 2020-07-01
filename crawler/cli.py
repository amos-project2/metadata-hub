"""Command line interface for the crawler.

Provides a command line interface for the REST API. It simply forwards
the calls to the REST endpoint.
"""


# Python imports
import json
import argparse
from sys import exit


# 3rd party modules
import requests


# Local imports
import crawler.services.environment as environment


_API = None


def check_connection() -> bool:
    """Helper method to check if the crawler is up and running.

    Returns:
        bool: True if connections are able to establish, False otherwise

    """
    url = f'{_API}'
    try:
        response = requests.get(url)
    except requests.ConnectionError:
        print(
            'Unable to establish connection to the crawler API.\n'
            'Please make sure the crawler is up and running and try again.'
        )
        return False
    return True


def make_request(url: str, post: bool = False, json_output: bool = False) -> None:
    """Helper function to make a request to the crawler API.

    Args:
        url (str): url to request
        post (bool, optional): use POST instead of GET. Defaults to False.

    """
    if post:
        response = requests.post(url)
    else:
        response = requests.get(url)
    data = json.loads(response.text or '{}')
    if response.ok:
        res = data.get('message', 'OK')
    else:
        res = data.get('error', 'Unavailable to load error message')
    if json_output:
        print(json.dumps(res, indent=4))
    else:
        print(res)


def info(subparser: argparse._SubParsersAction = None):
    """Forward to /info

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'info'. Defaults to None.

    """
    name = 'info'
    if subparser is None:
        make_request(f'{_API}/{name}', json_output=True)
        return
    subparser.add_parser(
        name,
        description='Get information about the current status of the crawler'
    )


def stop(
    subparser: argparse._SubParsersAction = None
):
    """Forward to /stop

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'stop'. Defaults to None.

    """
    name = 'stop'
    if subparser is None:
        make_request(f'{_API}/{name}', True)
        return
    subparser.add_parser(
        name,
        description='Stop the current execution of the crawler'
    )


def start(
    subparser: argparse._SubParsersAction = None,
    args: argparse.Namespace = None
):
    """Forward to /start?config={config}

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'start'. Defaults to None.
        args (argparse.Namespace, optional):
            Arguments of command 'start'. Defaults to None.

    """
    name = 'start'
    if subparser is None:
        make_request(f'{_API}/{name}?config={args.config}', True)
        return
    parser = subparser.add_parser(
        name,
        description='Start the crawler with given configuration'
    )
    parser.add_argument(
        'config',
        type=str,
        metavar='config',
        help=(
            'Configuration of the crawler execution. '
            'Either a valid JSON configuration itself or a '
            'filepath to a valid configuration file'
        )
    )


def pause(
    subparser: argparse._SubParsersAction = None
):
    """Forward to /pause

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'pause'. Defaults to None.

    """
    name = 'pause'
    if subparser is None:
        make_request(f'{_API}/{name}', True)
        return
    subparser.add_parser(
        name,
        description='Pause the current execution of the crawler'
    )


def unpause(
    subparser: argparse._SubParsersAction = None
):
    """Forward to /unpause

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'unpause'. Defaults to None.

    """
    name = 'continue'
    if subparser is None:
        make_request(f'{_API}/{name}', True)
        return
    subparser.add_parser(
        name,
        description='Continue the current execution of the crawler'
    )


def shutdown(
    subparser: argparse._SubParsersAction = None
):
    """Forward to /shutdown

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'shutdown'. Defaults to None.

    """
    name = 'shutdown'
    if subparser is None:
        requests.post(f'{_API}/{name}')
        return
    subparser.add_parser(
        name,
        description='Shutdown the crawler'
    )


def schedule_list(subparser: argparse._SubParsersAction = None):
    """Forward to /schedule/list

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'schedule-list'. Defaults to None.

    """
    name = 'schedule-list'
    if subparser is None:
        make_request(
            url=f'{_API}/schedule/list',
            post=True,
            json_output=True
        )
        return
    parser = subparser.add_parser(
        name,
        description='List the current schedule'
    )


def schedule_remove(
    subparser: argparse._SubParsersAction = None,
    args: argparse.Namespace = None
):
    """Forward to /schedule/remove?id={identifier}

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'schedule-remove'. Defaults to None.
        args (argparse.Namespace, optional):
            Arguments of command 'schedule-remove'. Defaults to None.

    """
    name = 'schedule-remove'
    if subparser is None:
        make_request(
            url=f'{_API}/schedule/remove?id={args.identifier}',
            post=False,
            json_output=False
        )
        return
    parser = subparser.add_parser(
        name,
        description='Remove the given configuration from the schedule'
    )
    parser.add_argument(
        'identifier',
        type=str,
        metavar='identifier',
        help='Identifier of the configuration to remove.'
    )


def intervals_list(subparser: argparse._SubParsersAction = None):
    """Forward to /intervals/list

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'intervals-list'. Defaults to None.

    """
    name = 'intervals-list'
    if subparser is None:
        make_request(
            url=f'{_API}/intervals/list',
            post=True,
            json_output=True
        )
        return
    parser = subparser.add_parser(
        name,
        description='List the current intervals'
    )

def intervals_remove(
    subparser: argparse._SubParsersAction = None,
    args: argparse.Namespace = None
):
    """Forward to /intervals/remove?id={identifier}

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'intervals-remove'. Defaults to None.
        args (argparse.Namespace, optional):
            Arguments of command 'intervals-remove'. Defaults to None.

    """
    name = 'intervals-remove'
    if subparser is None:
        make_request(
            url=f'{_API}/intervals/remove?id={args.identifier}',
            post=False,
            json_output=False
        )
        return
    parser = subparser.add_parser(
        name,
        description='Remove the given time interval.'
    )
    parser.add_argument(
        'identifier',
        type=str,
        metavar='identifier',
        help='Identifier of the time interval to remove.'
    )


def intervals_add(
    subparser: argparse._SubParsersAction = None,
    args: argparse.Namespace = None
):
    """Forward to /intervals/add?start={start}&end={end}&cpu={cpu}

    Args:
        subparser (argparse._SubParsersAction, optional):
            Parser for command 'intervals-add'. Defaults to None.
        args (argparse.Namespace, optional):
            Arguments of command 'intervals-add'. Defaults to None.

    """
    name = 'intervals-add'
    if subparser is None:
        make_request(
            url=f'{_API}/intervals/add?start={args.start}&end={args.end}&cpu={args.cpu}',
            post=False,
            json_output=False
        )
        return
    parser = subparser.add_parser(
        name,
        description='Add a time interval for maximum resource consumption.'
    )
    parser.add_argument(
        'start',
        type=str,
        metavar='start',
        help='Start of the interval.'
    )
    parser.add_argument(
        'end',
        type=str,
        metavar='end',
        help='End of the interval.'
    )
    parser.add_argument(
        'cpu',
        type=int,
        metavar='cpu',
        help='Maximum CPU level of the interval.'
    )


if __name__ == '__main__':
    try:
        environment.init()
    except environment.InvalidEnvironmentException as err:
        print(f'{str(err)} Aborted.')
        exit(1)
    _API =f'http://{environment.env.CRAWLER_HOST}:{environment.env.CRAWLER_PORT}'
    parser = argparse.ArgumentParser()
    subparser = parser.add_subparsers(title='command', dest='command')
    # Create parsers for each command
    info(subparser=subparser)
    stop(subparser=subparser)
    start(subparser=subparser)
    pause(subparser=subparser)
    unpause(subparser=subparser)
    shutdown(subparser=subparser)
    schedule_list(subparser=subparser)
    schedule_remove(subparser=subparser)
    intervals_list(subparser=subparser)
    intervals_remove(subparser=subparser)
    intervals_add(subparser=subparser)
    args = parser.parse_args()
    # Check connection and run command
    if not check_connection():
        exit(1)
    if args.command == 'info':
        info()
    if args.command == 'stop':
        stop()
    if args.command == 'start':
        start(args=args)
    if args.command == 'pause':
        pause()
    if args.command == 'continue':
        unpause()
    if args.command == 'shutdown':
        shutdown()
    if args.command == 'schedule-list':
        schedule_list()
    if args.command == 'schedule-remove':
        schedule_remove(args=args)
    if args.command == 'intervals-list':
        intervals_list()
    if args.command == 'intervals-remove':
        intervals_remove(args=args)
    if args.command == 'intervals-add':
        intervals_add(args=args)
