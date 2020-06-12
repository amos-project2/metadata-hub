"""Run the crawler."""


# Python imports
import logging
import threading
from sys import exit


# Local imports
import crawler.api as api
import crawler.treewalk as treewalk
import crawler.services.environment as environment
import crawler.database as database


if __name__ == '__main__':
    try:
        environment.init()
    except environment.InvalidEnvironmentException as err:
        print(f'{str(err)} Aborted.')
        exit(1)

    logging.basicConfig(
        level=environment.env.CRAWLER_LOGGING_LEVEL,
        format='%(asctime)s %(levelname)s %(module)s - %(funcName)s : %(message)s',
        datefmt='%H:%M:%S %Y-%m-%d'
    )
    thread_treewalk = treewalk.TreeWalkManager()
    thread_api = threading.Thread(target=api.start)
    thread_database_updater = database.DatabaseUpdater()
    thread_api.start()
    thread_treewalk.start()
    thread_database_updater.start()
    thread_api.join()
    thread_treewalk.join()
    thread_database_updater.join()
