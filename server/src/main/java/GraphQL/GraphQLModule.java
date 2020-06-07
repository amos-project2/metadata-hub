package GraphQL;

import Database.DatabaseProvider;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import graphql.GraphQL;

import java.io.IOException;

public class GraphQLModule extends AbstractModule
{
//    @Provides
//    @Singleton
//    static GraphQLDataFetchers provideGraphQLDataFetchers(DatabaseProvider databaseProvider)
//    {
//        return new GraphQLDataFetchers(databaseProvider);
//    }

    @Override
    protected void configure()
    {
       // this.bind(GraphQLDataFetchers.class).to(GraphQLDataFetchers.class).in(Singleton.class);
    }



    @Provides
    @Singleton
    static GraphQL provideGraphQL(MainGraphQLDataFetchers mainGraphQLDataFetchers, DatabaseProvider databaseProvider) throws IOException
    {
        return new MainGraphQLProvider(mainGraphQLDataFetchers, databaseProvider).init().getGraphQL();
    }


}
