package Start;

import Database.DatabaseProvider;
import GraphQL.GraphQLProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.ExecutionResult;
import org.jooq.Record;
import org.jooq.Result;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * A class where we can write small, fast tests in it to test it on develop time,
 * maybe also good candidates to move to our JUnit-Tests?!
 */
public class RuntimeTests
{
    private final Registry registry;

    public RuntimeTests(Registry registry) {this.registry = registry;}

    public void databaseTest() throws SQLException
    {
        DatabaseProvider databaseProvider = registry.getDatabaseProvider();
        try
        {
            //with jooq
            Result<Record> records = databaseProvider.getDslContext().resultQuery("SELECT * FROM public.testtable").fetch();
            System.out.println(records);

            //with normal jdbc
            try (Connection connection = databaseProvider.getHikariDataSource().getConnection())
            {
                ResultSet resultSet = connection.prepareStatement("SELECT * FROM public.testtable").executeQuery();
                resultSet.next();
                System.out.println("Testvalueoutput: " + resultSet.getString("testvalue"));
            }
        }
        catch (SQLException throwables)
        {
            System.out.println("Error in DatabaseTest: there was an error in accessing the database:\n\n");
            throw throwables;
        }
    }


    public void graphQLTest() throws IOException
    {
        GraphQLProvider graphQLProvider = registry.getGraphQLProvider();

        ExecutionResult execute = graphQLProvider.init().getGraphQL().execute("query {teststuff(id: \"1\") {id, testvalue}}");

        System.out.println(execute);
        String json = new ObjectMapper().writeValueAsString(execute.toSpecification());
        System.out.println(json);
    }


}
