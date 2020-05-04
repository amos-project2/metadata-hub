package Start;

import Database.DatabaseProvider;
import HelloWorld.GraphQLServer.GraphQLDataFetchers;
import HelloWorld.GraphQLServer.GraphQLProvider;
import JerseyServer.JerseyServer;
import graphql.nextgen.GraphQL;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Result;
import org.jooq.ResultQuery;
import org.jooq.impl.DSL;
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
            try(Connection connection = databaseProvider.getHikariDataSource().getConnection())
            {
                ResultSet resultSet = connection.prepareStatement("SELECT * FROM public.testtable").executeQuery();
                resultSet.next();
                System.out.println("Testvalueoutput: "+resultSet.getString("testvalue"));
            }
        }
        catch (SQLException throwables)
        {
            System.out.println("there was an error in accessing the database:\n\n");
            throwables.printStackTrace();
        }
    }


}
