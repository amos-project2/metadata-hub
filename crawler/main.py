"""Run the crawler."""


# Python imports
import logging
import threading
from sys import exit


# Local imports
import crawler.api as api
import crawler.treewalk as treewalk
import crawler.services.environment as environment
import crawler.treewalk.manager as manager
import crawler.treewalk.scheduler as scheduler
import crawler.treewalk.db_updater as db_updater


if __name__ == '__main__':
    # Setting up
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
    db_connection_data = dict(
        user=environment.env.DATABASE_USER,
        password=environment.env.DATABASE_PASSWORD,
        host=environment.env.DATABASE_HOST,
        port=environment.env.DATABASE_PORT,
        dbname=environment.env.DATABASE_NAME
    )
    measure_time = environment.env.CRAWLER_MEASURE_TIME
    tree_walk_state = treewalk.State()
    # Creating threads
    thread_treewalk_manager = manager.TreeWalkManager(
        db_info=db_connection_data,
        measure_time=measure_time,
        state=tree_walk_state
    )
    thread_api = threading.Thread(target=api.start)
    thread_database_updater = db_updater.DatabaseUpdater(
        db_info=db_connection_data,
        measure_time=measure_time
    )
    thread_treewalk_scheduler = scheduler.TreeWalkScheduler(
        db_info=db_connection_data,
        measure_time=measure_time,
        update_interval=environment.env.CRAWLER_SCHEDULER_INTERVAL
    )
    # Starting threads
    thread_api.start()
    thread_treewalk_manager.start()
    thread_database_updater.start()
    thread_treewalk_scheduler.start()
    # Joining them on shutdown
    thread_api.join()
    thread_treewalk_manager.join()
    thread_database_updater.join()
    thread_treewalk_scheduler.join()
