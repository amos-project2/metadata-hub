"""Type definition of time intervals for the resource limits."""


# Python imports
import json
import hashlib
import datetime
from typing import Tuple, Any


class TimeInterval:

    #: Weekdays
    WEEKDAYS = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ]

    @staticmethod
    def convert_curr_ts_to_total_time() -> int:
        """Converts the current time string to the total time.

        Returns:
            int: total time

        """
        ts_now = datetime.datetime.now()
        day, hours, minutes = (ts_now.isoweekday()-1, ts_now.hour, ts_now.minute)
        return (day * 24 * 60) + (hours * 60) + minutes


    @staticmethod
    def assert_valid(start_str: str, end_str: str) -> bool:
        """Assert if two given time strings (start, end) are valid.

        Checks if the given strings apply the format dd:hh:mm where dd is in
        range 00-06, hh in 00-23 and mm in 00-59.

        Args:
            start_str (str): start time string
            end_str (str): end time string

        Returns:
            bool: True if valid, False otherwise

        """
        try:
            for string in [start_str, end_str]:
                parts = string.split(':')
                if not all(len(part) == 2 for part in parts):
                    return False
                day, hours, minutes = map(int, parts)
                checks = [
                    0 <= day < 7,
                    0 <= hours < 24,
                    0 <= minutes < 60
                ]
                if not all(checks):

                    return False
        except:
            return False
        return True

    @staticmethod
    def parse(time_str: str) -> Tuple[int, str, str]:
        """Parse a time string.

        This method assumes that the given string is valid, s.t assert_valid
        was called beforehand.

        Args:
            time_str (str): time string

        Returns:
            Tuple[int, str, str]: total time, weekday, hours/minutes string

        """
        day, hours, minutes = map(int, time_str.split(':'))
        total_time = (day * 24 * 60) + (hours * 60) + minutes
        weekday = TimeInterval.WEEKDAYS[day]
        _, hm_str = time_str.split(':', 1)
        return (total_time, weekday, hm_str)

    def __init__(self, start_str: str, end_str: str, cpu_level: int):
        self._start_str = start_str
        self._end_str = end_str
        self._identifier = self._compute_identifier()
        self._cpu_level = cpu_level
        tmp = TimeInterval.parse(start_str)
        self._start_total_time, self._start_weekday, self._start_hm_str = tmp
        tmp = TimeInterval.parse(end_str)
        self._end_total_time, self._end_weekday, self._end_hm_str = tmp

    def _compute_identifier(self) -> str:
        """Compute the identifier for the time interval object.

        The start and end string must be already set in order to work.

        Returns:
            str: unique identifier

        """
        return hashlib.sha256(
            f'{self._start_str}{self._end_str}'.encode('utf-8')
        ).hexdigest()

    def __str__(self) -> str:
        """Override string representation.

        Returns:
            str: string representation

        """
        return (
            f'From {self._start_weekday} {self._start_hm_str} to '
            f'{self._end_weekday} {self._end_hm_str}'
        )

    def __repr__(self) -> str:
        """Override representation.

        Returns:
            str: representation

        """
        return (
            f'TimeInterval({self._start_weekday} {self._start_hm_str}, '
            f'{self._end_weekday} {self._end_hm_str})'
        )

    def __eq__(self, obj: Any) -> bool:
        """Override equals.

        Args:
            obj (Any): object to compare

        Returns:
            bool: True if they are equal, False otherwise

        """
        if not isinstance(obj, TimeInterval):
            return False
        return self._identifier == obj._identifier

    def to_json(self) -> dict:
        """Returns JSON represntation of a time interval object.

        Returns:
            dict: JSON representation

        """
        return {
            'start': f'{self._start_weekday} {self._start_hm_str}',
            'end': f'{self._end_weekday} {self._end_hm_str}',
            'cpu-level': self._cpu_level,
            'identifier': self._identifier
        }

    def overlaps(self, other: 'TimeInterval') -> bool:
        """Check if two time intervals overlap.

        Args:
            other (TimeInterval): time interval to compare with

        Returns:
            bool: True if they overlap, False otherwise

        """
        return any([
            other._start_total_time < self._start_total_time < other._end_total_time,
            other._start_total_time < self._end_total_time < other._end_total_time,
            self._start_total_time < other._start_total_time < self._end_total_time,
            self._start_total_time < other._end_total_time < self._end_total_time,
            self._start_total_time == other._start_total_time,
            self._end_total_time == other._end_total_time
        ])

    def in_between(self, total_time: int) -> bool:
        """Checks if the total is in this time interval.

        Args:
            total_time (int): total time to check

        Returns:
            bool: True if it is in between this interval, False otherwise

        """
        return self._start_total_time <= total_time < self._end_total_time
