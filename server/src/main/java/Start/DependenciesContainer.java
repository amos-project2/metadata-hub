package Start;

import Config.Config;
import Config.ConfigModule;
import Database.DatabaseModule;
import GraphQL.GraphQLModule;
import JerseyServer.HttpServerModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import lombok.Getter;

public class DependenciesContainer
{
    @Getter private final Injector injector;

    public DependenciesContainer(Config config)
    {
        injector = Guice.createInjector(
            new ConfigModule(config),
            new DatabaseModule(),
            new GraphQLModule(),
            new HttpServerModule());
//        DatabaseModule instance = injector.getInstance(DatabaseModule.class);
//        GraphQL instance2 = injector.getInstance(GraphQL.class);
    }
}
