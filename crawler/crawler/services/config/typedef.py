"""Type definition of the configuration of a TreeWalk execution.

This module defines the configuration of a TreeWalk execution and implements
the identifier generation for the configuration. Python's built-in hash
function is not applicable because it uses interpreter specific random seeds.
Thus, applying the same configuration values will result in different
identifiers in different interpreter executions. This will lead to problems
when using these identifiers on scheduled executions in the database from
possible other interpreter sessions. The expected behaviour is that the exact
same configuration values lead to the same identifier independently of the
interpreter session.
"""


# Python imports
import json
import hashlib
from typing import Union, List


# Local imports
import crawler.services.environment as environment


class Config:

    def __init__(self, data: dict):
        self._data = data
        self._name = self._data.get('name')
        self._author = self._data.get('author')
        self._description = self._data.get('description', '')
        self._start = self._data.get('time').get('start')
        self._interval = self._data.get('time').get('interval')
        self._directories = self._data.get('directories')
        self._cpu_level = self._data.get('options').get('cpu-level')
        self._package_size = self._data.get('options').get('package-size')
        self._platform = self._data.get('options').get('platform')
        self._force_update = self._data.get('options').get('force-update')
        self._exiftool_exec = {
            'Linux': environment.env.EXIFTOOL_LINUX,
            'Windows': environment.env.EXIFTOOL_WINDOWS
        }.get(self._platform)
        if 'identifier' not in self._data.keys():
            identifier = self._compute_identifier()
            self._data['identifier'] = identifier
            self._identifier = identifier
        else:
            self._identifier = self._data.get('identifier')

    def _compute_identifier(self) -> str:
        """Compute a unique identifier for the configuration.

        Returns:
            str: unique identifier

        """
        directories_string = ' '.join([
            f'{entry.get("path")}{entry.get("recursive")}'
            for entry in self._directories
        ])
        representation = (
            f'{self._name}'
            f'{self._author}'
            f'{self._description}'
            f'{self._start}'
            f'{self._interval}'
            f'{directories_string}'
            f'{self._cpu_level}'
            f'{self._package_size}'
            f'{self._platform}'
            f'{self._force_update}'
        )
        identifier = hashlib.sha256(representation.encode('utf-8')).hexdigest()
        return identifier

    def get_identifier(self) -> str:
        """Return the identifier of the configuration.

        Returns:
            str: unique identifier

        """
        return self._identifier

    def get_data(self, as_json: bool = False) -> Union[dict, str]:
        """Return the configuration data.

        Args:
            as_json (bool): return data as json string or dict

        Returns:
            Union[dict, str]: configuration data as dict or string

        """
        if as_json:
            return json.dumps(self._data)
        return self._data

    def get_name(self) -> str:
        """Return the name of the configuration.

        Returns:
            str: name of the configuration

        """
        return self._name

    def get_author(self) -> str:
        """Return the author of the configuration.

        Returns:
            str: author of the configuration

        """
        return self._author

    def get_description(self) -> str:
        """Return the description of the configuration.

        Returns:
            str: description of the configuration

        """
        return self._description

    def get_start(self) -> str:
        """Return the start timestamp of the configuration.

        Returns:
            str: start timestamp of the configuration

        """
        return self._start

    def get_interval(self) -> str:
        """Return the execution interval of the configuration.

        Returns:
            str: execution interval of the configuration

        """
        return self._interval

    def get_directories(self) -> List[dict]:
        """Return the directories of the configuration.

        Returns:
            List[dict]: directories of the configuration.

        """
        return self._directories

    def get_cpu_level(self) -> int:
        """Return the cpu level of the configuration.

        Returns:
            int: cpu level of the configuration

        """
        return self._cpu_level

    def get_package_size(self) -> int:
        """Return the package size of the configuration.

        Returns:
            int: package size of the configuration

        """
        return self._package_size

    def get_platform(self) -> str:
        """Return the platform of the configuration.

        Returns:
            str: platform of the configuration

        """
        return self._platform

    def get_force_update(self) -> str:
        """Return the force update flag of the configuration.

        Returns:
            str: force update flag of the configuration

        """
        return self._force_update

    def get_exiftool_executable(self) -> str:
        """Return the executable of the ExifTool of the configuration.

        Returns:
            str: path to the executable

        """
        return self._exiftool_exec
