"""Set up the application wide global environment variables.

Assumes that the environment variable 'METADATAHUB_ENV' is set to the .json
file that specifies these values.
"""


# Python imports
import os
import json


# 3rd party modules
import jsonschema


# Local imports
from . import env


# FIXME: These ones should have a more reliable solution
_SCHEMA_FILE = '../../../../../environment.schema'
_ENVIRONMENT_VARIABLE = 'METADATAHUB_ENV'


class InvalidEnvironmentException(Exception):
    """Raise if the provided environment is invalid."""
    pass


def init() -> None:
    """Initialize the global environment settings.

    Raises:
        InvalidEnvironmentException: if loading or validating the config fails

    """
    try:
        environment_file = os.environ[_ENVIRONMENT_VARIABLE]
    except KeyError as err:
        raise InvalidEnvironmentException(f'{_ENVIRONMENT_VARIABLE} not set.')
    schema_filepath = os.path.abspath(os.path.join(__file__, _SCHEMA_FILE))
    try:
        with open(schema_filepath, 'r') as fpointer:
            schema = json.load(fpointer)
        with open(environment_file, 'r') as fpointer:
            instance = json.load(fpointer)
        jsonschema.validate(schema=schema, instance=instance)
    except json.JSONDecodeError as err:
        raise InvalidEnvironmentException(
            f'Failed encoding json: {str(err)}'
        )
    except FileNotFoundError as err:
        raise InvalidEnvironmentException(str(err))
    except jsonschema.ValidationError as err:
        raise InvalidEnvironmentException(
            f'Failed validating json: {str(err)}'
        )
    env.DATABASE_NAME = instance.get('database-name')
    env.DATABASE_HOST = instance.get('database-host')
    env.DATABASE_PORT = instance.get('database-port')
    env.DATABASE_USER = instance.get('database-user')
    env.DATABASE_PASSWORD = instance.get('database-password')
    env.CRAWLER_HOST = instance.get('crawler-host')
    env.CRAWLER_PORT = instance.get('crawler-port')
