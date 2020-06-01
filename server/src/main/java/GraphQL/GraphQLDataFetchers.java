package GraphQL;

import Database.DatabaseProvider;
import Model.Metadatum;
import Model.File;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import graphql.schema.DataFetcher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;


@RequiredArgsConstructor
public class GraphQLDataFetchers
{
    private static final Logger log = LoggerFactory.getLogger(GraphQLDataFetchers.class);
    private final DatabaseProvider databaseProvider;

    /**
     * Data Fetcher is used by this GraphQL Query:
     * get_metadata(file_id: String!, sel_attributes: [String!], eav: Boolean) : [Attribute]
     *
     * Function:
     * Fetches the metadata of a file corresponding to the used file_id
     *
     * Options:
     * sel_attributes: If specified, fetches solely the selected attributes
     * eav: If specified and true, fetches the file metadata from the entity-attribute-value database table
     *
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher getFileMetadataFetcher() {
        return (DataFetcher<List<Metadatum>>) dataFetchingEnvironment ->
        {

            final String file_generic_id = dataFetchingEnvironment.getArgument("file_id");
            final ArrayList<String> requested_attributes = dataFetchingEnvironment.getArgument("sel_attributes");
            final Boolean useEAVTable = dataFetchingEnvironment.getArgument("eav");

            if (requested_attributes != null) {
                log.info("getMetadata: file_id = " + file_generic_id + " attributes = " + requested_attributes.toString());
            }

            if (useEAVTable != null && useEAVTable) {
                return queryFileMetadataEAV(file_generic_id, requested_attributes);
            } else {
                return queryFileMetadata(file_generic_id, requested_attributes);
            }
        };
    }

    /**
     * Data Fetcher is used by this GraphQL Query:
     * searchForPattern(pattern: String!, option: PatternOption!) : [File]
     *
     * Function:
     * If option == included: Searches for all files with "pattern" in their pathname
     * If option == excluded: Searches for all files without "pattern" in their pathname
     *
     * Options:
     * sel_attributes: If specified, fetches solely the selected attributes
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher searchForFileMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            final String pattern = dataFetchingEnvironment.getArgument("pattern");
            final String patternOption = dataFetchingEnvironment.getArgument("option");
            final String startTime = dataFetchingEnvironment.getArgument("startTime");
            final String endTime = dataFetchingEnvironment.getArgument("endTime");
            final ArrayList<String> selection_attributes = dataFetchingEnvironment.getArgument("sel_attributes");
            int limitFetchingSize = 0;
            if(dataFetchingEnvironment.getArgument("limitFetchingSize") != null)
            {
                limitFetchingSize = dataFetchingEnvironment.getArgument("limitFetchingSize");
            }

            if (selection_attributes != null)
            {
                log.info("searchForPattern: pattern = " + pattern + " option = " + patternOption + " sel_attributes = " + selection_attributes.toString());
            }

            return queryFilesWithOptions(pattern, patternOption, startTime, endTime, selection_attributes, limitFetchingSize);
        };
    }

    /**
     * Data Fetcher is used by this GraphQL Query:
     * get_dir_metadata(dir_path: String!, sel_attributes: [String!], eav: Boolean) : [File]
     *
     * Function:
     * Fetches all file metadata of specified directory
     *
     * Options:
     * sel_attributes: If specified, fetches solely the selected attributes
     * eav: If specified and true, fetches the file metadata from the entity-attribute-value database table
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher getDirMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            final String dir_path = dataFetchingEnvironment.getArgument("dir_path");
            final ArrayList<String> selection_attributes = dataFetchingEnvironment.getArgument("sel_attributes");
            final Boolean useEAVTable = dataFetchingEnvironment.getArgument("eav");

            if (selection_attributes != null)
            {
                log.info("getDirMetadata: dir_path = " + dir_path + " sel_attributes = " + selection_attributes.toString());
            }

            if (useEAVTable != null && useEAVTable)
            {
                return queryDirMetadataEAV(dir_path, selection_attributes);
            }
            else
            {
                return queryDirMetadata(dir_path, selection_attributes);
            }
        };
    }

    @SuppressWarnings("unchecked")
    private List<Metadatum> queryFileMetadata(String file_generic_id, ArrayList<String> requested_attributes) throws SQLException, IOException {
        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.files WHERE id=?")) {
            selectStmt.setLong(1, Long.parseLong(file_generic_id));
            try (ResultSet rs = selectStmt.executeQuery()) {
                if (!rs.next()) return null;

                log.info("SQL Result : " + rs.toString());
                //TODO Right here we don't have the actual Attribute ID theres no attribute ID in public.file_generic
                String metadatum_id = "<No AttributeID, when the EAV_Table isn't used";
                String tree_walk_id = rs.getString("crawl_id");

                String jsonFileMetadata = rs.getString("metadata");
                ObjectMapper mapper = new ObjectMapper();
                Map<String, String> map = mapper.readValue(jsonFileMetadata, Map.class);

                ArrayList<Metadatum> metadata = new ArrayList<>();
                helperAddSelAttributes(requested_attributes, metadatum_id, tree_walk_id, file_generic_id, metadata, map);

                return metadata;
            }
        }
    }
    private List<Metadatum> queryFileMetadataEAV(String file_generic_id, ArrayList<String> requested_attributes) throws SQLException {

        HikariDataSource dataSource = databaseProvider.getHikariDataSource();


        StringBuilder sql_statement = new StringBuilder("SELECT * FROM public.file_generic_data_eav WHERE file_generic_id=? ");
        if (requested_attributes != null)
        {
            sql_statement.append("AND (");
            for (int i = 0; i + 1 < requested_attributes.size(); i++)
            {
                sql_statement.append("attribute=? OR ");
            }
            sql_statement.append(" attribute=?)");
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement(sql_statement.toString()))
        {
            selectStmt.setLong(1, Long.parseLong(file_generic_id));
            if (requested_attributes != null)
            {
                for (int i = 0; i < requested_attributes.size(); i++)
                {
                    selectStmt.setString(i + 2, requested_attributes.get(i));
                }
            }

            try (ResultSet rs = selectStmt.executeQuery())
            {
                ArrayList<Metadatum> metadata = new ArrayList<>();
                rs.getFetchSize();

                while (rs.next())
                {
                    metadata.add(new Metadatum(rs.getString("id"), rs.getString("tree_walk_id"),
                        file_generic_id, rs.getString("attribute"), rs.getString("value")));
                }

                return metadata;
            }
        }

    }

    @SuppressWarnings("unchecked")
    private List<File> queryDirMetadata(String dir_path, ArrayList<String> selection_attributes) throws SQLException, IOException {
        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        //SelectStmt = Join on tree_walk_id; Concat the paths and remove the leftmost slash "/home/" + "/testDir/" = "/home/testDir/"
        //TODO Use treewalk table and file table for the absolute path
        //TODO Or save the absolute path also in the file table
        //TODO Don't join on TreeWalkID? but on file_id?
        /*try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement
                 ("SELECT *" +
                     " FROM public.file_generic INNER JOIN public.tree_walk ON public.file_generic.\"tree_walk_id\" = public.tree_walk.\"id\"" +
                     " WHERE CONCAT(public.tree_walk.root_path, RIGHT(public.file_generic.sub_dir_path, length(public.file_generic.sub_dir_path) - 1)) LIKE ?")) {
*/
        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement
                 ("SELECT * FROM public.files " +
                     "WHERE public.files.dir_path LIKE ?")) {
            selectStmt.setString(1, dir_path + "%");
            try (ResultSet rs = selectStmt.executeQuery()) {
                ArrayList<File> files = new ArrayList<>();
                while (rs.next()) {
                    //TODO Work on the Model? Right now every query asks for all available information in the database
                    //TODO and doesn't ask just for the selected File and Attribute Types
                    //TODO That is the file_id in the database, for the actual attribte_id there would be necessary
                    // another query to the file_generic_data_eav table
                    //String metdatum_id = rs.getString("id");
                    String metdatum_id = "<No Attribute ID, when the EAV_table isn't used>";
                    String tree_walk_id = rs.getString("crawl_id");
                    //TODO File only has relative path as attribute, user right now doesnt get information back about the treewalk
                    //TODO Right now the user can't calculate the absolute path themselves -> think about which information we send back
                    //TODO change GraphQL such that it doesn't resemble database scheme but delivers the most useful information to the user?
                    //String absolute_file_path = rs.getString("root_path") + rs.getString("sub_dir_path").substring(1);
                    String absolute_file_path = rs.getString("dir_path");
                    String jsonFileMetadata = rs.getString("metadata");
                    ArrayList<Metadatum> metadata = new ArrayList<>();
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> attribute_map = mapper.readValue(jsonFileMetadata, Map.class);

                    helperAddSelAttributes(selection_attributes, metdatum_id, tree_walk_id, absolute_file_path, metadata, attribute_map);
                    files.add(new File(metdatum_id, tree_walk_id,
                        absolute_file_path, rs.getString("name"), rs.getString("type"),
                        rs.getString("creation_time"), rs.getString("modification_time"),
                        rs.getString("access_time"), jsonFileMetadata, metadata));

                }

                return files;
            }
        }
    }

    private List<File> queryDirMetadataEAV(String dir_path, ArrayList<String> selection_attributes) throws SQLException {

        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

/*
        StringBuilder sql_statement = new StringBuilder("SELECT *" +
                " FROM public.file_generic" +
                " INNER JOIN public.tree_walk ON public.file_generic.\"tree_walk_Id\" = public.tree_walk.\"id\"" +
                " INNER JOIN public.file_generic_data_eav ON public.file_generic.\"tree_walk_id\" = public.file_generic_data_eav.\"tree_walk_id\" " +
                " WHERE CONCAT(public.tree_walk.root_path, RIGHT(public.file_generic.sub_dir_path, length(public.file_generic.sub_dir_path) - 1)) LIKE ?");
*/
        StringBuilder sql_statement = new StringBuilder("SELECT *, public.files.id AS file_id " +
            "FROM public.files " +
            "INNER JOIN public.file_generic_data_eav ON public.files.\"id\" = public.file_generic_data_eav.\"file_generic_id\" " +
            "WHERE public.files.dir_path LIKE ? ");

        if (selection_attributes != null) {
            sql_statement.append("AND (");
            for (int i = 0; i + 1 < selection_attributes.size(); i++) {
                sql_statement.append("public.file_generic_data_eav.attribute = ? OR ");
            }
            sql_statement.append(" public.file_generic_data_eav.attribute=?)");
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement(sql_statement.toString())) {
            selectStmt.setString(1, dir_path + "%");
            if (selection_attributes != null) {
                for (int i = 0; i < selection_attributes.size(); i++) {
                    selectStmt.setString(i + 2, selection_attributes.get(i));
                }
            }
            log.info(selectStmt.toString());

            try (ResultSet rs = selectStmt.executeQuery()) {
                Map<String, File> files = new HashMap<>();

                while (rs.next()) {
                    String file_id = rs.getString("file_id");
                    if (!files.containsKey(file_id)) {
                        List<Metadatum> metadata = new ArrayList<>();
                        files.put(file_id, new File(file_id, rs.getString("tree_walk_id"), rs.getString("sub_dir_path"),
                            rs.getString("name"), rs.getString("file_typ"),
                            rs.getString("file_create_date"), rs.getString("file_modify_date"),
                            rs.getString("file_access_date"), rs.getString("metadata"), metadata));
                    }

                    File file = files.get(file_id);
                    file.getMetadata().add(new Metadatum(rs.getString("id"), rs.getString("tree_walk_id"),
                        file_id, rs.getString("attribute"), rs.getString("value")));
                }

                return new ArrayList<>(files.values());
            }
        }
    }

    private List<File> queryFilesWithOptions(String pattern, String patternOption, String startTime, String endTime,
                                             ArrayList<String> selection_attributes, int limitFetchingSize) throws SQLException, IOException {
        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        //SelectStmt = Join on tree_walk_id; Concat the paths and remove the leftmost slash "/home/" + "/testDir/" = "/home/testDir/"
        //TODO Use treewalk table and file table for the absolute path
        //TODO Or save the absolute path also in the file table
        //TODO Don't join on TreeWalkID? but on file_id?
        /*try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement
                 ("SELECT *" +
                     " FROM public.file_generic INNER JOIN public.tree_walk ON public.file_generic.\"tree_walk_id\" = public.tree_walk.\"id\"" +
                     " WHERE CONCAT(public.tree_walk.root_path, RIGHT(public.file_generic.sub_dir_path, length(public.file_generic.sub_dir_path) - 1)) LIKE ?")) {
*/
        //TODO Talk about database structure! Right now sub_dir_path is the absolute path but without the filename?!

        //Options
        String patternOptionStmt = "";
        if(patternOption != null && patternOption.equals("excluded"))
        {
            patternOptionStmt = " NOT ";
        }

        String startTimeStmt = "";
        if(startTime != null)
        {
            startTimeStmt = " AND public.files.creation_time >= \'" + startTime + "\'";
        }

        String endTimeStmt = "";
        if(endTime != null)
        {
            endTimeStmt = " AND public.files.creation_time < \'" + endTime + "\'";
        }

        String fetchingSizeLimitStmt = "";
        if(limitFetchingSize > 0)
        {
            fetchingSizeLimitStmt = " FETCH FIRST " + limitFetchingSize + " ROWS ONLY";
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement
                 ("SELECT * " +
                     "FROM public.files " +
                     "WHERE CONCAT(public.files.dir_path, '/', public.files.name)"  + patternOptionStmt + " LIKE ? " +
                     startTimeStmt + endTimeStmt + fetchingSizeLimitStmt)) {

            selectStmt.setString(1, "%" + pattern + "%");
            System.out.println(selectStmt.toString());
            try (ResultSet rs = selectStmt.executeQuery()) {
                ArrayList<File> files = new ArrayList<>();
                while (rs.next()) {
                    //TODO Placeholder for Attribute ID
                    String metdatum_id = "<No Attribute ID, when the EAV_table isn't used>";
                    String tree_walk_id = rs.getString("crawl_id");
                    //TODO File only has relative path as attribute, user right now doesnt get information back about the treewalk
                    //TODO Right now the user can't calculate the absolute path themselves -> think about which information we send back
                    //TODO change GraphQL such that it doesn't resemble database scheme but delivers the most useful information to the user?
                    //String absolute_file_path = rs.getString("root_path") + rs.getString("sub_dir_path").substring(1);
                    String absolute_file_path = rs.getString("dir_path");
                    String jsonFileMetadata = rs.getString("metadata");
                    ArrayList<Metadatum> metadata = new ArrayList<>();
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> attribute_map = mapper.readValue(jsonFileMetadata, Map.class);

                    helperAddSelAttributes(selection_attributes, metdatum_id, tree_walk_id, absolute_file_path, metadata, attribute_map);
                    files.add(new File(metdatum_id, tree_walk_id,
                        absolute_file_path, rs.getString("name"), rs.getString("type"),
                        rs.getString("creation_time"), rs.getString("modification_time"),
                        rs.getString("access_time"), jsonFileMetadata, metadata));

                }

                return files;
            }
        }
    }


    private void helperAddSelAttributes(ArrayList<String> selection_attributes, String attribute_id, String tree_walk_id, String absolute_file_path, ArrayList<Metadatum> metadata, Map<String, String> attribute_map) {
        if (selection_attributes == null)
        {
            for (Map.Entry<String, String> entry : attribute_map.entrySet())
            {
                String key = entry.getKey();
                Object value = entry.getValue();
                metadata.add(new Metadatum(attribute_id, tree_walk_id, absolute_file_path, key, value.toString()));
            }
        }
        else
        {
            for (String attribute : selection_attributes)
            {
                String attr_value = attribute_map.get(attribute);
                if(attr_value == null)
                {
                    continue;
                }
                metadata.add(new Metadatum(attribute_id, tree_walk_id, absolute_file_path, attribute, attr_value));
            }
        }
    }
}
