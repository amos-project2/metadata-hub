package Database;

public class DatabaseSchemaDefinition {

    /**
     * Columns of the table "files"
     *
     * Notice: needs to be specified if we're using multiple tables!
     */
    public static final String FILES_TABLE = "files";

    public static final String FILES_ID = "id";
    public static final String FILES_CRAWL_ID = "crawl_id";
    public static final String FILES_DIR_PATH = "dir_path";
    public static final String FILES_NAME = "name";
    public static final String FILES_TYPE = "type";
    public static final String FILES_SIZE = "size";
    public static final String FILES_METADATA = "metadata";
    public static final String FILES_CREATION_TIME = "creation_time";
    public static final String FILES_ACCESS_TIME = "access_time";
    public static final String FILES_MODIFICATION_TIME = "modification_time";
    public static final String FILES_FILE_HASH = "file_hash";

}
