"""Type definition of a response object used for internal communcation"""


# Python imports
import json
from typing import Any


class Response:
    """Class representing a response.

    Attributes:
        success (bool): processing of last command was successful or not
        message (Any): response data
        command (str): command that was executed

    """

    def __init__(self, success: bool, message: Any, command: str):
        self.success = success
        self.message = message
        self.command = command

    def to_json(self):
        return json.dumps({
            'success': self.success,
            'message': self.message,
            'command': self.command
        })
