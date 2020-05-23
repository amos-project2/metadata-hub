package TestSetup;

import Database.DatabaseProvider;
import GraphQL.GraphQLDataFetchers;
import GraphQL.GraphQLProvider;
import JerseyServer.JerseyServer;
import Start.ApplicationConfig;
import Start.Start;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import java.io.IOException;
import java.util.Properties;

public class TestSetup {

    public static JerseyServer testServer;
    public static Client testClient;

    public static void setupServer(){
        Properties config = new ApplicationConfig(null).getConfig();
        DatabaseProvider databaseProvider = new DatabaseProvider(config);
        GraphQLDataFetchers graphQLDataFetchers = new GraphQLDataFetchers(databaseProvider);
        GraphQLProvider graphQLProvider = new GraphQLProvider(graphQLDataFetchers, databaseProvider);
        try {
            testServer = new JerseyServer(graphQLProvider.init().getGraphQL(), config);
        } catch (IOException e) {
            e.printStackTrace();
        }
        testServer.start();
    }

    public static void shutdownServer(){
        testServer.shutdown();
        testServer = null;
    }

    public static void setupClient(){
        testClient = ClientBuilder.newClient();
    }

    public static void shutdownClient(){
        testClient.close();
        testClient = null;
    }
}
