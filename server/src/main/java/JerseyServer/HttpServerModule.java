package JerseyServer;

import Config.Config;
import Database.DatabaseProvider;
import GraphQL.GraphQLDataFetchers;
import GraphQL.GraphQLProvider;
import Start.Start;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import graphql.GraphQL;

public class HttpServerModule extends AbstractModule
{
//    @Provides
//    @Singleton
//    static JerseyServer provideDatabaseController(GraphQL graphQL, Config config)
//    {
//        return new JerseyServer(graphQL, config);
//    }


    @Override
    protected void configure()
    {
       // this.bind(JerseyServer.class).to(JerseyServer.class).in(Singleton.class);
    }

}
