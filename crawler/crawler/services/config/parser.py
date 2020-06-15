"""Parser module for the crawler config."""


# Python imports
import os
import json
import jsonschema
from typing import Any


# Local imports
from .typedef import Config
import crawler.services.environment as environment


class ConfigParsingException(Exception):
    """Raise when parsing the config failed"""
    pass


class ConfigParser:
    """This class takes care of parsing the crawler configuration"""


    def __init__(self, data: Any):
        self._data = data
        with open(environment.env.SCHEMA_CRAWLER_CONFIG, 'r') as fpointer:
            self._schema = json.load(fpointer)


    def _parse_from_dict(self, convert: bool = False) -> Config:
        """Parse the config from dictionary data.

        The data can either be the content of a file or directly passed from
        the url parameter. Therefore, the convert flag is used to specify if
        the data should be loaded as JSON. This is required for the url variant
        but not for the content of a file, because this was already loaded.

        Args:
            convert (bool, optional): load the data using json. Defaults to False.

        Raises:
            ConfigParsingException: if the data does not apply the schema

        Returns:
            Config: parsed configuration
        """

        if convert:
            self._data = json.loads(self._data)
        try:
            jsonschema.validate(schema=self._schema, instance=self._data)
        except jsonschema.ValidationError as err:
            print(err)
            raise ConfigParsingException('JSON data does not apply the schema')
        platform = self._data.get('paths').get('exiftool')
        exiftool = environment.env.EXIFTOOL_LINUX
        if platform == 'Windows':
            exiftool = environment.env.EXIFTOOL_WINDOWS
        result = Config(
            data=self._data,
            exiftool=exiftool
        )
        return result


    def _parse_from_filepath(self) -> Config:
        """Parse the data from given filepath.

        The method tries to load the data from the given file. On success,
        it calls the parse_from_dict method to finally validate and parse
        the content.

        Raises:
            ConfigParsingException: if the filepath is invalid
            ConfigParsingException: if the content of the file is no json

        Returns:
            Config: parsed configuration
        """

        try:
            with open(self._data, 'r') as fpointer:
                data = json.load(fpointer)
        except FileNotFoundError:
            raise ConfigParsingException(f'Invalid filepath \'{self._data}\'')
        except json.JSONDecodeError:
            raise ConfigParsingException(
                f'Invalid json \'{os.path.abspath(self._data)}\''
            )
        self._data = data
        return self._parse_from_dict()


    def parse(self) -> Config:
        """Parse the given configuration.

        The config can be either passed as a json object or a filepath pointing
        to a configuration file.

        Raises:
            ConfigParsingException: if parsing fails in any manner

        Returns:
            Config: parsed configuration

        """
        try:
            config = self._parse_from_dict(convert=True)
        except json.JSONDecodeError:
            config = self._parse_from_filepath()
        return config
