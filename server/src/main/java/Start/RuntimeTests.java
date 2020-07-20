package Start;

import Database.Database;
import Database.DatabaseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Injector;
import graphql.ExecutionResult;
import graphql.GraphQL;
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
    private final DependenciesContainer dependenciesContainer;
    private final Injector injector;


    public RuntimeTests(DependenciesContainer dependenciesContainer)
    {
        this.dependenciesContainer = dependenciesContainer;
        this.injector=dependenciesContainer.getInjector();
    }

    public void databaseTest() throws SQLException, DatabaseException {
        Database database =injector.getInstance(Database.class);
        try
        {
            //with jooq
            Result<Record> records = database.getDslContext().resultQuery("SELECT * FROM public.testtable").fetch();
            System.out.println(records);

            //with normal jdbc
            try (Connection connection = database.gC())
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
        GraphQL graphQL = injector.getInstance(GraphQL.class);

        ExecutionResult execute = graphQL.execute("query {teststuff(id: \"1\") {id, testvalue}}");

        System.out.println(execute);
        String json = new ObjectMapper().writeValueAsString(execute.toSpecification());
        System.out.println(json);
    }


}
