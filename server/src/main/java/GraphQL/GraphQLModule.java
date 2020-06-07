package GraphQL;

import Database.Database;
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
    static GraphQL provideGraphQL(MainGraphQLDataFetchers mainGraphQLDataFetchers, Database database) throws IOException
    {
        return new MainGraphQLProvider(mainGraphQLDataFetchers, database).init().getGraphQL();
    }


}
