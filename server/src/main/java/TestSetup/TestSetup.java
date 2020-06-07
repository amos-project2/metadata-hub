package TestSetup;

import Config.ApplicationConfig;
import Config.Config;
import Database.DatabaseProvider;
import GraphQL.MainGraphQLDataFetchers;
import GraphQL.MainGraphQLProvider;
import JerseyServer.JerseyServer;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import java.io.IOException;

public class TestSetup {

    public static JerseyServer testServer;
    public static Client testClient;

    public static void setupServer(){
        Config config = null;
        try {
            config = new ApplicationConfig(null, System.getenv("METADATAHUB_SERVER_CONFIG")).getConfig();
        } catch (Exception e) {
            e.printStackTrace();
        }
        DatabaseProvider databaseProvider = new DatabaseProvider(config);
        MainGraphQLDataFetchers mainGraphQLDataFetchers = new MainGraphQLDataFetchers(databaseProvider);
        MainGraphQLProvider mainGraphQLProvider = new MainGraphQLProvider(mainGraphQLDataFetchers, databaseProvider);
        try {
            testServer = new JerseyServer(mainGraphQLProvider.init().getGraphQL(), config);
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
