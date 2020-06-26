"""Type definition of a task in the schedule

This type definition is just used for an easier implementation in the scheduler.
It provides all colums except the actual config.
"""


# Python imports
import json
import datetime


class Task:

    def __init__(
            self,
            identifier: str,
            config: dict,
            timestamp_next: datetime.datetime,
            force_update: bool,
            pending: bool,
            interval: int
    ):
        self.identifier = identifier
        self.config = config
        self.timestamp_next = timestamp_next
        self.force_update = force_update
        self.pending = pending
        self.interval = interval
        self.update_in_schedule = False

    def to_json(self, indent: int = None) -> str:
        return {
            "identifier": self.identifier,
            "config": self.config,
            "timestamp": str(self.timestamp_next),
            "force": self.force_update,
            "pending": self.pending,
            "interval": self.interval
        }
