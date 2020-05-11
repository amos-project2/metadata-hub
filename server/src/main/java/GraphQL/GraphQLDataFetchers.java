package GraphQL;

import Database.DatabaseProvider;
import Model.Attribute;
import com.zaxxer.hikari.HikariDataSource;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;


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

    public DataFetcher getMetadataFetcher()
    {
        return (DataFetcher<List<Attribute>>) dataFetchingEnvironment -> {
            final String id = dataFetchingEnvironment.getArgument("file");
            final Set<String> attributes = dataFetchingEnvironment.getArgument("attribute_names");

            System.out.println("getMetadata: file_id = " + id + " attributes = " + attributes.toString());

            HikariDataSource dataSource = databaseProvider.getHikariDataSource();

            //TODO Fix to use just the requested attributes
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement("SELECT * from public.file_generic WHERE id=?");)
            {
                selectStmt.setLong(1, Long.parseLong(id));
                ResultSet rs = selectStmt.executeQuery();
                if (!rs.next()) return null;

                //HashSet<String, Object> ret = new HashMap<>();
                //ret.put("id", rs.getString(1));
                //ret.put("testvalue", rs.getString(2));
                //ret.put("nezahl", rs.getInt(3));
                //return ret;

                List<Attribute> list = new ArrayList<Attribute>();
                list.add(new Attribute("1", "2", "3", "name", "value"));
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
