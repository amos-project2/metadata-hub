package GraphQL.Model;

public class GraphQLSchemaDefinition {
    /**
     * Definition of GraphQL Query searchForFileMetadata()
     */
    public static final String QUERY_NAME = "searchForFileMetadata";
    public static final String QUERY_FILES_IDS = "file_ids";
    public static final String QUERY_CRAWL_IDS = "crawl_ids";
    public static final String QUERY_DIR_PATH = "dir_path";
    public static final String QUERY_DIR_PATH_OPTION = "dir_path_option";
    public static final String QUERY_FILE_NAME = "file_name";
    public static final String QUERY_FILE_NAME_OPTION = "file_name_option";
    public static final String QUERY_FILE_TYPES = "file_types";
    public static final String QUERY_SIZE = "size";
    public static final String QUERY_SIZE_OPTION = "size_option";
    public static final String QUERY_START_CREATION_TIME = "start_creation_time";
    public static final String QUERY_END_CREATION_TIME = "end_creation_time";
    public static final String QUERY_START_ACCESS_TIME = "start_access_time";
    public static final String QUERY_END_ACCESS_TIME = "end_access_time";
    public static final String QUERY_START_MODIFICATION_TIME = "start_modification_time";
    public static final String QUERY_END_MODIFICATION_TIME = "end_modification_time";
    public static final String QUERY_FILE_HASHES = "file_hashes";
    public static final String QUERY_METADATA_ATTRIBUTES = "metadata_attributes";
    public static final String QUERY_METADATA_VALUES = "metadata_values";
    public static final String QUERY_METADATA_OPTIONS = "metadata_options";
    public static final String QUERY_METADATA_FILTER_LOGIC_OPTIONS = "metadata_filter_logic_options";
    public static final String QUERY_METADATA_FILTER_LOGIC = "metadata_filter_logic";
    public static final String QUERY_SELECTED_ATTRIBUTES = "selected_attributes";
    public static final String QUERY_SORT_BY_ATTRIBUTES = "sortBy";
    public static final String QUERY_SORT_BY_OPTIONS = "sortBy_options";
    public static final String QUERY_LIMIT_FETCHING_SIZE = "limitFetchingSize";
    public static final String QUERY_OFFSET = "offset";
    public static final String QUERY_SHOW_DELETED = "showDeleted";

    /**
     * Object Type Definition of "File"
     */
    public static final String FILE_ID = "id";
    public static final String FILE_CRAWL_ID = "crawl_id";
    public static final String FILE_DIR_PATH = "dir_path";
    public static final String FILE_NAME = "name";
    public static final String FILE_TYPE = "type";
    public static final String FILE_SIZE = "size";
    public static final String FILE_METADATA = "metadata";
    public static final String FILE_CREATION_TIME = "creation_time";
    public static final String FILE_ACCESS_TIME = "access_time";
    public static final String FILE_MODIFICATION_TIME = "modification_time";
    public static final String FILE_FILE_HASH = "file_hash";

    /**
     * Object Type Definition of "Metadatum"
     */
    public static final String METADATUM_NAME = "name";
    public static final String METADATUM_VALUE = "value";

    /**
     * Enum Type Definition of "FilterLogicOption"
     */
    public static final String FILTER_LOGIC_OPTION_AND = "and";
    public static final String FILTER_LOGIC_OPTION_OR = "or";
    public static final String FILTER_LOGIC_OPTION_ONLY_LOGIC = "only_logic_string";



}
