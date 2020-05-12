"""Definition of a single trace entry."""


# Python imports
import json


class TraceEntry:
    """Class representation of a trace entry.

    Attributes:
        timestamp (str): timestamp of the record
        node (str): node that was recorded

    """

    def __init__(self, timestamp: str, node: str) -> None:
        self.timestamp = timestamp
        self.node = node

    def __str__(self) -> str:
        """Override string representation.

        Returns:
            str: string representation

        """
        representation = dict(
            timestamp=self.timestamp,
            node=self.node
        )
        return json.dumps(representation)


    @classmethod
    def from_str(cls, string: str) -> 'TraceEntry':
        """Initialize a trace entry from a string.

        Args:
            string (str): string representation

        Returns:
            TraceEntry: object representation of the string

        """
        data = json.loads(string)
        timestamp = data.get('timestamp')
        node = data.get('node')
        return cls(
            timestamp=timestamp,
            node=node
        )
