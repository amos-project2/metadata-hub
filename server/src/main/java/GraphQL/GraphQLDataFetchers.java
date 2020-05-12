package GraphQL;

import Database.DatabaseProvider;
import Model.Attribute;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import graphql.schema.DataFetcher;
import lombok.RequiredArgsConstructor;
import org.jooq.meta.derby.sys.Sys;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;


@RequiredArgsConstructor
public class GraphQLDataFetchers
{

    private final DatabaseProvider databaseProvider;

    public DataFetcher getDatabaseTestFetcher()
    {
        return dataFetchingEnvironment ->
        {
            final String id = dataFetchingEnvironment.getArgument("id");

            System.out.println(id + " ID");
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
        return (DataFetcher<List<Attribute>>) dataFetchingEnvironment -> {

            final String file_generic_id = dataFetchingEnvironment.getArgument("file");
            final ArrayList<String> requested_attributes = dataFetchingEnvironment.getArgument("attributes");

            if(requested_attributes != null)
            {
                System.out.println("getMetadata: file_id = " + file_generic_id + " attributes = " + requested_attributes.toString());
            }

            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.file_generic WHERE id=?");)
            {
                selectStmt.setLong(1, Long.parseLong(file_generic_id));
                ResultSet rs = selectStmt.executeQuery();
                if (!rs.next()) return null;

                System.out.println("SQL Result : " + rs.toString());
                String attribute_id = rs.getString("id");
                String tree_walk_id = rs.getString("tree_walk_id");

                String jsonFileMetadata = rs.getString("metadata");
                ObjectMapper mapper = new ObjectMapper();
                Map<String, String> map = mapper.readValue(jsonFileMetadata, Map.class);

                ArrayList<Attribute> list = new ArrayList<>();

                if(requested_attributes == null)
                {
                    for(Map.Entry<String, String> entry: map.entrySet())
                    {
                        String key = entry.getKey();
                        String value = entry.getValue().toString();
                        list.add(new Attribute(attribute_id, tree_walk_id, file_generic_id, key, value));
                    }
                }else
                    {
                    for (String attribute : requested_attributes)
                    {
                        list.add(new Attribute(attribute_id, tree_walk_id, file_generic_id, attribute, map.get(attribute)));
                    }
                }

                return list;
            }
            catch (Exception e)
            {
                e.printStackTrace();
                return null;
            }

        };
    }

    public DataFetcher getFileFetcher()
    {
        return null;
    }

    public DataFetcher getAttributeFetcher()
    {
        return null;
    }

    public DataFetcher getTreeWalkFetcher()
    {
        return null;
    }
}
