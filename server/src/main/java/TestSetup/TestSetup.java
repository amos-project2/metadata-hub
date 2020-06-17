package TestSetup;

import Config.Config;
import Config.Impl.ApplicationConfigImpl;
import Database.Database;
import GraphQL.Fetcher.MainGraphQLDataFetchers;
import GraphQL.Provider.MainGraphQLProvider;
import JerseyServer.HttpServer;
import Start.DependenciesContainer;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;

public class TestSetup {

    public static HttpServer testServer;
    public static Client testClient;

    public static void setupServer(DependenciesContainer dependenciesContainer){
        Config config = null;
        try {
            config = new ApplicationConfigImpl(null, System.getenv("METADATAHUB_SERVER_CONFIG")).getConfig();
        } catch (Exception e) {
            e.printStackTrace();
        }
        Database database = dependenciesContainer.getInjector().getInstance(Database.class);
        MainGraphQLDataFetchers mainGraphQLDataFetchers = dependenciesContainer.getInjector().getInstance(MainGraphQLDataFetchers.class); //new MainGraphQLDataFetchers(database);
        MainGraphQLProvider mainGraphQLProvider = dependenciesContainer.getInjector().getInstance(MainGraphQLProvider.class); //new MainGraphQLProvider(mainGraphQLDataFetchers, database);
//        try {
            testServer = dependenciesContainer.getInjector().getInstance(HttpServer.class);//new HttpServer(mainGraphQLProvider.init().getGraphQL(), config);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
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
