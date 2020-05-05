package Start;

import Database.DatabaseProvider;
import GraphQL.GraphQLDataFetchers;
import GraphQL.GraphQLProvider;
import JerseyServer.JerseyServer;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.ExecutionResult;
import org.jooq.Record;
import org.jooq.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;


public class Start
{
    private static final Logger logger = LoggerFactory.getLogger(Start.class);

    public static void main(String[] args) throws IOException
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        DatabaseProvider databaseProvider = new DatabaseProvider();
        Start.databaseTest(databaseProvider);


        GraphQLDataFetchers graphQLDataFetchers = new GraphQLDataFetchers(databaseProvider);
        GraphQLProvider graphQLProvider = new GraphQLProvider(graphQLDataFetchers, databaseProvider);

        ExecutionResult execute = graphQLProvider.init().graphQL().execute("query {teststuff(id: \"1\") {id, testvalue}}");

        System.out.println(execute);
        String json = new ObjectMapper().writeValueAsString(execute.toSpecification());
        System.out.println(json);

        JerseyServer jerseyServer = new JerseyServer(graphQLProvider.init().graphQL());
        jerseyServer.start();

        System.out.println("all services are started");
    }


    public static void databaseTest(DatabaseProvider databaseProvider)
    {
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
            System.out.println("there was an error in accessing the database:\n\n");
            throwables.printStackTrace();
        }
    }


}