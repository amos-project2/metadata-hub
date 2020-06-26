"""Type definition of a command object used for internal communcation"""


# Python imports
from typing import Any


class Command:
    """Class representing a command.

    Attributes:
        command (str): command to execute
        data (Any): data required for executing the command

    """

    def __init__(self, command: str, data: Any = None):
        self.command = command
        self.data = data
