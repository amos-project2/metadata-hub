package GraphQL.Fetcher.Impl;

import Database.Database;
import GraphQL.Fetcher.MainGraphQLDataFetchers;
import GraphQL.SearchForFileMetadataFetcher;
import com.google.inject.Inject;
import graphql.schema.DataFetcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class MainGraphQLDataFetchersImpl implements MainGraphQLDataFetchers
{
    private static final Logger log = LoggerFactory.getLogger(MainGraphQLDataFetchers.class);
    private final Database database;

    @Inject
    public MainGraphQLDataFetchersImpl(Database database)
    {
        this.database = database;
    }

    /**
     * Data Fetcher is used by this GraphQL Query:
     * searchForPattern(options...) : [File]
     * <p>
     * Concrete method description can be find in the schema.graphqls
     */
    @Override public DataFetcher searchForFileMetadataFetcher()
    {
        return new SearchForFileMetadataFetcher(database);
    }


}
