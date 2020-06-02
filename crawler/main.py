"""Run the crawler."""


# Python imports
import logging
import threading
from sys import exit


# Local imports
import crawler.api as api
import crawler.treewalk as treewalk
import crawler.services.environment as environment


if __name__ == '__main__':
    try:
        environment.init()
    except environment.InvalidEnvironmentException as err:
        print(f'{str(err)} Aborted.')
        exit(1)

    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s %(levelname)s %(module)s - %(funcName)s : %(message)s',
        datefmt='%H:%M:%S %Y-%m-%d'
    )
    thread_api = threading.Thread(target=api.start)
    thread_treewalk = threading.Thread(target=treewalk.run)
    thread_treewalk.start()
    thread_api.start()
