# Python imports
import os
import json
import jsonschema
from typing import Any


# Local imports
from .typedef import Config


class ConfigParsingException(Exception):
    """Raise when parsing the config failed"""
    pass


class ConfigParser:

    # FIXME: This should have a more reliable solution
    _SCHEMA_FILE = '../../../../../crawler-config.schema'

    def __init__(self, data: Any):
        self._data = data
        self._config = None
        schema_filepath = os.path.abspath(os.path.join(
            __file__, ConfigParser._SCHEMA_FILE
        ))
        with open(schema_filepath, 'r') as fpointer:
            self._schema = json.load(fpointer)


    def _parse_from_dict(self):
        try:
            jsonschema.validate(schema=self._schema, instance=self._data)
        except jsonschema.ValidationError:
            raise ConfigParsingException('JSON data does not apply the schema')
        result = Config(self._data)
        return result

    def _parse_from_filepath(self):
        try:
            with open(self._data, 'r') as fpointer:
                data = json.load(fpointer)
        except FileNotFoundError:
            raise ConfigParsingException(f'Invalid filepath \'{self._data}\'')
        except json.JSONDecodeError:
            raise ConfigParsingException(f'Invalid json \'{self._data}\'')
        self._data = data
        return self._parse_from_dict()

    def parse(self) -> Config:
        if isinstance(self._data, str):
            config = self._parse_from_filepath()
        else:
            config = self._parse_from_dict()
        return config
