package GraphQL;

import Database.DatabaseProvider;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.throwingproviders.ThrowingProviderBinder;
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
    static GraphQL provideGraphQL(GraphQLDataFetchers graphQLDataFetchers, DatabaseProvider databaseProvider) throws IOException
    {
        return new GraphQLProvider(graphQLDataFetchers, databaseProvider).init().getGraphQL();
    }


}
