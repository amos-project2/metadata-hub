package GraphQL;

import Database.DatabaseProvider;
import Model.Attribute;
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

    @SuppressWarnings("rawtypes")
    public DataFetcher getDatabaseTestFetcher()
    {
        return dataFetchingEnvironment ->
        {
            final String id = dataFetchingEnvironment.getArgument("id");

            log.info(id + " ID");
            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.testtable WHERE id=?"))
            {
                selectStmt.setLong(1, Long.parseLong(id));
                ResultSet rs = selectStmt.executeQuery();
                if (!rs.next()) return null;

                HashMap<String, Object> ret = new HashMap<>();
                ret.put("id", rs.getString(1));
                ret.put("testvalue", rs.getString(2));
                ret.put("nezahl", rs.getInt(3));
                return ret;
            }
            catch (Exception e)
            {
                e.printStackTrace();
                return null;
            }
        };
    }

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
        return (DataFetcher<List<Attribute>>) dataFetchingEnvironment ->
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
    private List<Attribute> queryFileMetadata(String file_generic_id, ArrayList<String> requested_attributes) throws SQLException, IOException {
        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.file_generic WHERE id=?")) {
            selectStmt.setLong(1, Long.parseLong(file_generic_id));
            try (ResultSet rs = selectStmt.executeQuery()) {
                if (!rs.next()) return null;

                log.info("SQL Result : " + rs.toString());
                //TODO Right here we don't have the actual Attribute ID theres no attribute ID in public.file_generic
                //String attribute_id = rs.getString("id");
                String attribute_id = "<No AttributeID, when the EAV_Table isn't used";
                String tree_walk_id = rs.getString("tree_walk_id");

                String jsonFileMetadata = rs.getString("metadata");
                ObjectMapper mapper = new ObjectMapper();
                Map<String, String> map = mapper.readValue(jsonFileMetadata, Map.class);

                ArrayList<Attribute> attributes = new ArrayList<>();
                helperAddSelAttributes(requested_attributes, attribute_id, tree_walk_id, file_generic_id, attributes, map);

                return attributes;
            }
        }
    }
    private List<Attribute> queryFileMetadataEAV(String file_generic_id, ArrayList<String> requested_attributes) throws SQLException {

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
                ArrayList<Attribute> attributes = new ArrayList<>();
                rs.getFetchSize();

                while (rs.next())
                {
                    attributes.add(new Attribute(rs.getString("id"), rs.getString("tree_walk_id"),
                        file_generic_id, rs.getString("attribute"), rs.getString("value")));
                }

                return attributes;
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
                 ("SELECT * FROM public.file_generic " +
                     "WHERE public.file_generic.sub_dir_path LIKE ?")) {
            selectStmt.setString(1, dir_path + "%");
            try (ResultSet rs = selectStmt.executeQuery()) {
                ArrayList<File> files = new ArrayList<>();
                while (rs.next()) {
                    //TODO Work on the Model? Right now every query asks for all available information in the database
                    //TODO and doesn't ask just for the selected File and Attribute Types
                    //TODO That is the file_id in the database, for the actual attribte_id there would be necessary
                    // another query to the file_generic_data_eav table
                    //String attribute_id = rs.getString("id");
                    String attribute_id = "<No Attribute ID, when the EAV_table isn't used>";
                    String tree_walk_id = rs.getString("tree_walk_id");
                    //TODO File only has relative path as attribute, user right now doesnt get information back about the treewalk
                    //TODO Right now the user can't calculate the absolute path themselves -> think about which information we send back
                    //TODO change GraphQL such that it doesn't resemble database scheme but delivers the most useful information to the user?
                    //String absolute_file_path = rs.getString("root_path") + rs.getString("sub_dir_path").substring(1);
                    String absolute_file_path = rs.getString("sub_dir_path");
                    String jsonFileMetadata = rs.getString("metadata");
                    ArrayList<Attribute> attributes = new ArrayList<>();
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> attribute_map = mapper.readValue(jsonFileMetadata, Map.class);

                    helperAddSelAttributes(selection_attributes, attribute_id, tree_walk_id, absolute_file_path, attributes, attribute_map);
                    files.add(new File(attribute_id, tree_walk_id,
                        absolute_file_path, rs.getString("name"), rs.getString("file_typ"),
                        rs.getString("file_create_date"), rs.getString("file_modify_date"),
                        rs.getString("file_access_date"), jsonFileMetadata, attributes));

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
        StringBuilder sql_statement = new StringBuilder("SELECT *, public.file_generic.id AS file_id " +
            "FROM public.file_generic " +
            "INNER JOIN public.file_generic_data_eav ON public.file_generic.\"id\" = public.file_generic_data_eav.\"file_generic_id\" " +
            "WHERE public.file_generic.sub_dir_path LIKE ? ");

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
                        List<Attribute> attributes = new ArrayList<>();
                        files.put(file_id, new File(file_id, rs.getString("tree_walk_id"), rs.getString("sub_dir_path"),
                            rs.getString("name"), rs.getString("file_typ"),
                            rs.getString("file_create_date"), rs.getString("file_modify_date"),
                            rs.getString("file_access_date"), rs.getString("metadata"), attributes));
                    }

                    File file = files.get(file_id);
                    file.getAttributes().add(new Attribute(rs.getString("id"), rs.getString("tree_walk_id"),
                        file_id, rs.getString("attribute"), rs.getString("value")));
                }

                return new ArrayList<>(files.values());
            }
        }
    }



    private void helperAddSelAttributes(ArrayList<String> selection_attributes, String attribute_id, String tree_walk_id, String absolute_file_path, ArrayList<Attribute> attributes, Map<String, String> attribute_map) {
        if (selection_attributes == null)
        {
            for (Map.Entry<String, String> entry : attribute_map.entrySet())
            {
                String key = entry.getKey();
                Object value = entry.getValue();
                attributes.add(new Attribute(attribute_id, tree_walk_id, absolute_file_path, key, value.toString()));
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
                attributes.add(new Attribute(attribute_id, tree_walk_id, absolute_file_path, attribute, attr_value));
            }
        }
    }
}
