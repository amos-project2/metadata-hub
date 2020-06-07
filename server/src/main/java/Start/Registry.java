package Start;

import Database.DatabaseProvider;
import GraphQL.MainGraphQLDataFetchers;
import GraphQL.MainGraphQLProvider;
import JerseyServer.JerseyServer;
import lombok.Getter;

import java.io.IOException;

//TODO maybe seperate registry and creation of its elements
public class Registry
{
    @Getter private final DatabaseProvider databaseProvider;
    @Getter private final MainGraphQLDataFetchers mainGraphQLDataFetchers;
    @Getter private final MainGraphQLProvider mainGraphQLProvider;
    @Getter private final JerseyServer jerseyServer;

    public Registry() throws IOException
    {
        databaseProvider = new DatabaseProvider(Start.getConfig());
        mainGraphQLDataFetchers = new MainGraphQLDataFetchers(databaseProvider);
        mainGraphQLProvider = new MainGraphQLProvider(mainGraphQLDataFetchers, databaseProvider);
        jerseyServer = new JerseyServer(mainGraphQLProvider.init().getGraphQL(), Start.getConfig());
        jerseyServer.start();
    }


    public void shutdown()
    {
        this.jerseyServer.shutdownNow();
        this.databaseProvider.shutdown();
    }
}
