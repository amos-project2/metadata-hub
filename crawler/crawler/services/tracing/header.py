"""Definition of a the trace file header."""


# Python imports
import json


class TraceHeader:
    """Class representation of a trace header.

    Attributes:
        root (str): directory to crawl
        output (str): output directory
        date (str): date when trace was started

    """
    def __init__(self, root: str, output: str, date: str) -> None:
        self.root = root
        self.output = output
        self.date = date


    def __str__(self) -> str:
        """Override string representation.

        Returns:
            str: string representation

        """
        representation = dict(
            root=self.root,
            output=self.output,
            date=self.date
        )
        return json.dumps(representation)


    def match(self, header: 'TraceHeader') -> bool:
        """Check if two headers match.

        For now, it's required that both traces were invoked on the same
        input directory.

        Args:
            header (TraceHeader): reference trace header

        Returns:
            bool: True if they match, False otherwise

        """
        return self.root == header.root


    @classmethod
    def from_str(cls, string: str) -> 'TraceHeader':
        """Initialize a trace header from a string.

        Args:
            string (str): string representation

        Returns:
            TraceHeadery: object representation of the string

        """
        data = json.loads(string)
        root = data.get('root')
        output = data.get('output')
        date = data.get('date')
        return cls(
            root=root,
            output=output,
            date=date
        )

