package GraphQL.Provider;

import java.io.IOException;

public interface MainGraphQLProvider
{
    /**
     * you must call this method, to initialize the GraphQlProvider first,
     * after you can fetch the GraphQL-instance
     */
	MainGraphQLProvider init() throws IOException;

	graphql.GraphQL getGraphQL();
}
