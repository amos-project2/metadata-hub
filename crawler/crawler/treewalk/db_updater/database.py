"""Database connection for the database updater.

The database updater only deletes entries from the files table that exceeded
their timeout after being marked as deleted.
"""


# Python imports
import logging
import datetime
from typing import List, Union, Tuple


# Local imports
from crawler.database import measure_time
from crawler.database import DatabaseConnectionBase


_logger = logging.getLogger(__name__)


class DBUpdaterDatabaseConnection(DatabaseConnectionBase):

    def __init__(self, db_info: dict, measure_time: bool):
        super(DBUpdaterDatabaseConnection, self).__init__(
            db_info=db_info,
            measure_time=measure_time
        )

    @measure_time
    def delete_files(self, ids: List[int]) -> int:
        """Remove the given IDs from the files table.

        Args:
            ids (List[int]): list of IDs

        Returns:
            int: number of deleted rows or None on error

        """
        if not ids:
            return 0
        curs = self.con.cursor()
        sql = curs.mogrify('DELETE FROM files WHERE id IN %s;', (tuple(ids),))
        try:
            curs.execute(sql, ids)
            num = curs.rowcount
            curs.close()
            self.con.commit()
        except Exception as e:
            _logger.warning(f'Failed deleting files: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return num

    @measure_time
    def get_ids_to_delete(self) -> List[Tuple[int, datetime.datetime]]:
        """Get the list of IDs which are marked as to be deleted.

        The result consists of a set of tuples with the corresponding ID and
        the timestamp when the file was marked as to delete.
        The calling method is responsible for checking of the time limit
        is already exceeded.

        FIXME: The performance may break if there is a massive amount of files.

        Returns:
            List[Tuple(int, str)]: list of items (ID, timestamp) or None on error

        """
        sql = 'SELECT id, deleted_time FROM files WHERE deleted;'
        curs = self.con.cursor()
        try:
            curs.execute(sql)
            entries = curs.fetchall()
            curs.close()
            self.con.commit()
        except Exception as e:
            _logger.warning(f'Failed deleting files: {str(e)}')
            curs.close()
            self.con.rollback()
            return None
        return entries
