"""Managing trace records of the TreeWalk algorithm.

This module is used for recording/reading trace data that is create by the
TreeWalk algorithm. The functionality is implemented in the Tracer class.
A tracer is responsible for persist already processed nodes in a TreeWalk run
and initialize a new run with the already processed nodes.
"""


# Python imports
import os
import datetime
import threading
from typing import List


# Local imports
from .entry import TraceEntry
from .header import TraceHeader


class Tracer:
    """Tracer class.

    Attributes:
        _processed (List[str]): list of already processed nodes
        _lock (threading.Lock): lock for synchronization between multiple
                                    threads
        _clear (bool): clear present trace data?
        _trace_file (str): path of the trace file
        _header (TraceHeader): trace header

    """

    #: Predefined datetime format
    _TIMESTAMP_FORMAT = '%Y-%m-%d-%H-%M-%S'

    def __init__(self, config: dict) -> None:
        """Initialize the object.

        Initialize the given config variables and create/read the trace file.
        Also initialize the record of already processed nodes for later use.

        Args:
            config (dict): data of configuration file

        Raises:
            ValueError: if the given trace file is not empty and does not match
                            the given configuration

        """
        # Initialize given configuration
        self._processed = []
        self._lock = threading.Lock()
        self._clear = config.get('options', {}).get('clearTrace', False)
        self._trace_file = config.get('paths', {}).get('trace')
        self._header = TraceHeader(
            root=config.get('paths', {}).get('input', ''),
            output=config.get('paths', {}).get('output', ''),
            date=datetime.datetime.now().strftime(Tracer._TIMESTAMP_FORMAT)
        )
        # Use empty initialization if there is no trace data
        if self._clear or not os.path.isfile(self._trace_file):
            self._write_header()
            return
        with open(self._trace_file, 'r') as trace_fp:
            lines = [line.rstrip() for line in trace_fp.readlines()]
        if not lines:
            self._write_header()
            return
        # Check if header match, otherwise raise a ValueError.
        # Traces of other root directories should not be mixed.
        header_ref, *entries = lines
        header_ref = TraceHeader.from_str(header_ref.strip())
        if not self._header.match(header_ref):
            raise ValueError(
                'Trace header of specified trace file violates config.'
            )
        self._processed = [
            TraceEntry.from_str(entry.rstrip()) for entry in entries
        ]


    def _write_header(self) -> None:
        """Write the header to the trace file."""
        with open(self._trace_file, 'w') as trace_fp:
            trace_fp.write(f'{str(self._header)}\n')


    def get_processed_nodes(self) -> List[str]:
        """Return the list of processed nodes.

        These nodes are already recorded in the trace file. This list can be
        used by the other modules to skip already processed directories.

        Returns:
            List[str]: absolute filepaths of already processed nodes.

        """
        return {entry.node: True for entry in self._processed}


    def add_node(self, node: str) -> None:
        """Add a node to the trace file.

        This method is used for updating the trace file with processed nodes.
        It simply appends the corresponding trace entry to the trace file.
        The implementation locks the critical section with a threading lock,
        so multiple threads can call this method concurrently.

        Args:
            node (str): path of the processed node

        """
        timestamp = datetime.datetime.now().strftime(Tracer._TIMESTAMP_FORMAT)
        entry = TraceEntry(
            timestamp=timestamp,
            node=node
        )
        try:
            self._lock.acquire()
            with open(self._trace_file, 'a') as trace_fp:
                trace_fp.write(f'{str(entry)}\n')
        finally:
            self._lock.release()
