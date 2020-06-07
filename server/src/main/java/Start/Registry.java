package Start;

import Database.Database;
import GraphQL.MainGraphQLDataFetchers;
import GraphQL.MainGraphQLProvider;
import JerseyServer.JerseyServer;
import lombok.Getter;

import java.io.IOException;

//TODO maybe seperate registry and creation of its elements
public class Registry
{
//    @Getter private final Database database;
//    @Getter private final MainGraphQLDataFetchers mainGraphQLDataFetchers;
//    @Getter private final MainGraphQLProvider mainGraphQLProvider;
//    @Getter private final JerseyServer jerseyServer;
//
//    public Registry() throws IOException
//    {
//        database = new Database(Start.getConfig());
//        mainGraphQLDataFetchers = new MainGraphQLDataFetchers(database);
//        mainGraphQLProvider = new MainGraphQLProvider(mainGraphQLDataFetchers, database);
//        jerseyServer = new JerseyServer(mainGraphQLProvider.init().getGraphQL(), Start.getConfig());
//        jerseyServer.start();
//    }
//
//
//    public void shutdown()
//    {
//        this.jerseyServer.shutdownNow();
//        this.database.shutdown();
//    }
}
