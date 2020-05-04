package Start;

import Database.DatabaseProvider;
import HelloWorld.GraphQLServer.GraphQLProvider;
import JerseyServer.JerseyServer;
import graphql.nextgen.GraphQL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;


public class Start
{
    private static final Logger logger = LoggerFactory.getLogger(Start.class);

    public static void main(String[] args) throws IOException
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        DatabaseProvider databaseProvider = new DatabaseProvider();
        GraphQLProvider graphQLProvider = new GraphQLProvider();

        JerseyServer jerseyServer = new JerseyServer(graphQLProvider.init().graphQL());
        jerseyServer.start();

        System.out.println("all services are started");
    }
}
