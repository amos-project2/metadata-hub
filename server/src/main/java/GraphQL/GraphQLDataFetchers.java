package GraphQL;

import Database.DatabaseProvider;
import Model.Attribute;
import Model.File;
import Start.Start;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import graphql.schema.DataFetcher;
import lombok.RequiredArgsConstructor;
import org.jooq.meta.derby.sys.Sys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;


@RequiredArgsConstructor
public class GraphQLDataFetchers
{
    private static final Logger log = LoggerFactory.getLogger(GraphQLDataFetchers.class);

    private final DatabaseProvider databaseProvider;

    public DataFetcher getDatabaseTestFetcher()
    {
        return dataFetchingEnvironment ->
        {
            final String id = dataFetchingEnvironment.getArgument("id");

            log.info(id + " ID");
            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.testtable WHERE id=?");)
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

    //Only accesses the file_generic table and extracts the metadata out of the "metadata" field
    public DataFetcher getMetadataFetcher()
    {
        return (DataFetcher<List<Attribute>>) dataFetchingEnvironment ->
        {

            final String file_generic_id = dataFetchingEnvironment.getArgument("file_id");
            final ArrayList<String> requested_attributes = dataFetchingEnvironment.getArgument("sel_attributes");
            final Boolean eav = dataFetchingEnvironment.getArgument("eav");

            if (eav != null && eav == true)
            {
                return helperEAVAccess(file_generic_id, requested_attributes);
            }

            if (requested_attributes != null)
            {
                log.info("getMetadata: file_id = " + file_generic_id + " attributes = " + requested_attributes.toString());
            }

            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.file_generic WHERE id=?");)
            {
                selectStmt.setLong(1, Long.parseLong(file_generic_id));
                try (ResultSet rs = selectStmt.executeQuery();)
                {
                    if (!rs.next()) return null;

                    log.info("SQL Result : " + rs.toString());
                    String attribute_id = rs.getString("id");
                    String tree_walk_id = rs.getString("tree_walk_id");

                    String jsonFileMetadata = rs.getString("metadata");
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> map = mapper.readValue(jsonFileMetadata, Map.class);

                    ArrayList<Attribute> list = new ArrayList<>();

                    if (requested_attributes == null)
                    {
                        for (Map.Entry<String, String> entry : map.entrySet())
                        {
                            String key = entry.getKey();
                            Object value = entry.getValue();
                            list.add(new Attribute(attribute_id, tree_walk_id, file_generic_id, key, value.toString()));
                        }
                    }
                    else
                    {
                        for (String attribute : requested_attributes)
                        {
                            list.add(new Attribute(attribute_id, tree_walk_id, file_generic_id, attribute, map.get(attribute)));
                        }
                    }

                    return list;
                }
            }
        };
    }

    private List<Attribute> helperEAVAccess(String file_generic_id, List<String> requested_attributes) throws Exception
    {

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
             PreparedStatement selectStmt = connection.prepareStatement(sql_statement.toString());)
        {
            selectStmt.setLong(1, Long.parseLong(file_generic_id));
            if (requested_attributes != null)
            {
                for (int i = 0; i < requested_attributes.size(); i++)
                {
                    selectStmt.setString(i + 2, requested_attributes.get(i));
                }
            }

            try (ResultSet rs = selectStmt.executeQuery();)
            {
                ArrayList<Attribute> list = new ArrayList<>();
                rs.getFetchSize();

                while (rs.next())
                {
                    list.add(new Attribute(rs.getString("id"), rs.getString("tree_walk_id"),
                        file_generic_id, rs.getString("attribute"), rs.getString("value")));
                }

                return list;
            }
        }

    }

    //Only accesses the file_generic table and extracts the metadata out of the "metadata" field
    public DataFetcher getDirMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            final String dir_path = dataFetchingEnvironment.getArgument("dir_path");
            final ArrayList<String> selection_attributes = dataFetchingEnvironment.getArgument("sel_attributes");
            final Boolean eav = dataFetchingEnvironment.getArgument("eav");

            if (eav != null && eav == true)
            {
                //TODO Implement EAV Access? Or just stick to the JsonVariant
                //return helperEAVAccess(dir_path, selection_attributes);
            }

            if (selection_attributes != null)
            {
                log.info("getDirMetadata: dir_path = " + dir_path + " sel_attributes = " + selection_attributes.toString());
            }

            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            //SelectStmt = Join on tree_walk_id; Concat the paths and remove the leftmost slash "/home/" + "/testDir/" = "/home/testDir/"
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT *" +
                         " FROM public.file_generic INNER JOIN public.tree_walk ON public.file_generic.\"tree_walk_Id\" = public.tree_walk.\"id\"" +
                         " WHERE CONCAT(public.tree_walk.root_path, RIGHT(public.file_generic.sub_dir_path, length(public.file_generic.sub_dir_path) - 1)) LIKE ?"))
            {
                selectStmt.setString(1, dir_path + "%");
                try (ResultSet rs = selectStmt.executeQuery();)
                {
                    ArrayList<File> files = new ArrayList<>();
                    while(rs.next())
                    {
                        //TODO Work on the Model? Right now every query asks for all available information in the database
                        //TODO and doesn't ask just for the selected File and Attribute Types
                        //That is the file_id in the database, for the actual attribte_id there would be necessary
                        // another query to the file_generic_data_eav table
                        String attribute_id = rs.getString("id");
                        String tree_walk_id = rs.getString("tree_walk_id");
                        //TODO File only has relative path as attribute, user right now doesnt get information back about the treewalk
                        //TODO Right now the user can't calculate the absolute path themselves -> think about which information we send back
                        //TODO change GraphQL such that it doesn't resemble database scheme but delivers the most useful information to the user?
                        String absolute_file_path = rs.getString("root_path") + rs.getString("sub_dir_path").substring(1);
                        String jsonFileMetadata = rs.getString("metadata");
                        ArrayList<Attribute> attributes = new ArrayList<>();
                        ObjectMapper mapper = new ObjectMapper();
                        Map<String, String> attribute_map = mapper.readValue(jsonFileMetadata, Map.class);

                        //TODO maybe refactor later
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
                                attributes.add(new Attribute(attribute_id, tree_walk_id, absolute_file_path, attribute, attribute_map.get(attribute)));
                            }
                        }
                        files.add(new File(attribute_id, tree_walk_id,
                            absolute_file_path, rs.getString("name"), rs.getString("file_typ"),
                            rs.getString("file_create_date"), rs.getString("file_modify_date"),
                            rs.getString("file_access_date"), jsonFileMetadata, attributes));

                    }

                    return files;
                }
            }
        };
    }
}
