class Env:
    # Database to connect to
    DATABASE_NAME = None
    # Host the database is running on
    DATABASE_HOST = None
    # Port the database is running on
    DATABASE_PORT = None
    # Username for database
    DATABASE_USER = None
    # Password for database
    DATABASE_PASSWORD = None
    # Host the crawler should run on
    CRAWLER_HOST = None
    # Port the crawler should run on
    CRAWLER_PORT = None
    # Update interval of the database
    CRAWLER_DB_UPDATE_INTERVAL = None
    # Update interval of the scheduler
    CRAWLER_SCHEDULER_INTERVAL = None
    # Measure execution times in crawler
    CRAWLER_MEASURE_TIME = None
    # Logging level of the crawler
    CRAWLER_LOGGING_LEVEL = None
    # Path of Linux exiftool
    EXIFTOOL_LINUX = None
    # Path of Windows exiftool
    EXIFTOOL_WINDOWS = None
    # Schema file for crawler config
    SCHEMA_CRAWLER_CONFIG = None


env = Env()
