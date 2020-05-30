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


# Base of repository
_METADATAHUB_BASE = os.path.abspath(
    os.path.join(
        __file__,
        os.path.join(*['..' for _ in range(5)])
    )
)

# Schemata files
_METADATAHUB_ENV_SCHEMA = os.path.join(*[
    _METADATAHUB_BASE,
    'configs',
    'environment.schema'
])
_METADATAHUB_CRAWLER_CONFIG_SCHEMA = os.path.join(*[
    _METADATAHUB_BASE,
    'configs',
    'crawler-config.schema'
])

# Enviroment for MetadataHub
_METADATAHUB_ENV = 'METADATAHUB_ENV'
_METADATAHUB_ENV_DEFAULT = os.path.join(*[
    _METADATAHUB_BASE,
    'configs',
    'environment.default.json'
])

# Exiftool Linux
_METADATAHUB_EXIFTOOL_LINUX = 'METADATAHUB_EXIFTOOL_LINUX'
_METADATAHUB_EXIFTOOL_LINUX_DEFAULT = os.path.join(*[
    _METADATAHUB_BASE,
    'crawler',
    'exiftool',
    'exiftoolLinux',
    'exiftool'
])

# Exiftool Windows
_METADATAHUB_EXIFTOOL_WINDOWS = 'METADATAHUB_EXIFTOOL_WINDOWS'
_METADATAHUB_EXIFTOOL_WINDOWS_DEFAULT = os.path.join(*[
    _METADATAHUB_BASE,
    'crawler',
    'exiftool',
    'exiftoolWindows',
    'exiftool.exe'
])


class InvalidEnvironmentException(Exception):
    """Raise if the provided environment is invalid."""
    pass


def init() -> None:
    """Initialize the global environment settings.

    Raises:
        InvalidEnvironmentException: if loading or validating the config fails

    """
    # Parse and validate environment settings
    try:
        environment_file = os.environ[_METADATAHUB_ENV]
    except KeyError as err:
        environment_file = _METADATAHUB_ENV_DEFAULT
    try:
        with open(_METADATAHUB_ENV_SCHEMA, 'r') as fpointer:
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
    # Set exiftool paths
    try:
        exiftool_linux = os.environ[_METADATAHUB_EXIFTOOL_LINUX]
    except KeyError:
        exiftool_linux = _METADATAHUB_EXIFTOOL_LINUX_DEFAULT
    try:
        exiftool_windows = os.environ[_METADATAHUB_EXIFTOOL_WINDOWS]
    except KeyError:
        exiftool_windows = _METADATAHUB_EXIFTOOL_WINDOWS_DEFAULT
    # Init the shared env object
    env.DATABASE_NAME = instance.get('database-name')
    env.DATABASE_HOST = instance.get('database-host')
    env.DATABASE_PORT = instance.get('database-port')
    env.DATABASE_USER = instance.get('database-user')
    env.DATABASE_PASSWORD = instance.get('database-password')
    env.CRAWLER_HOST = instance.get('crawler-host')
    env.CRAWLER_PORT = instance.get('crawler-port')
    env.EXIFTOOL_LINUX = exiftool_linux
    env.EXIFTOOL_WINDOWS = exiftool_windows
    env.SCHEMA_CRAWLER_CONFIG = _METADATAHUB_CRAWLER_CONFIG_SCHEMA
