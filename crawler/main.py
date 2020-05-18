
# Python imports
import threading


# Local imports
import crawler.api as api
import crawler.treewalk as treewalk

if __name__ == '__main__':
    thread_api = threading.Thread(
        target=api.start,
        kwargs={'host': 'localhost', 'port': 9000}
    )
    thread_treewalk = threading.Thread(
        target=treewalk.run
    )
    thread_treewalk.start()
    thread_api.start()
