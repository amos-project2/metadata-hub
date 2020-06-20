"""Interface for the Database updater thread."""


# Local imports
import crawler.communication as communication


def shutdown() -> None:
    """Shutdown the database updater thread."""
    command = communication.Command(
        command=communication.DATABASE_UPDATER_SHUTDOWN,
        data=None
    )
    communication.database_updater_input.put(command)
