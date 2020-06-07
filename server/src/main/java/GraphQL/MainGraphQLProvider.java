package GraphQL;

import Database.DatabaseProvider;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import com.google.inject.Singleton;
import graphql.GraphQL;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import lombok.Getter;
import lombok.RequiredArgsConstructor;


import java.io.IOException;
import java.net.URL;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;


@RequiredArgsConstructor
@Singleton
public class MainGraphQLProvider
{
    private final MainGraphQLDataFetchers mainGraphQLDataFetchers;
    private final DatabaseProvider databaseProvider;
    @Getter private GraphQL graphQL;

    public MainGraphQLProvider init() throws IOException
    {
        URL url = Resources.getResource("schema.graphqls");
        String sdl = Resources.toString(url, Charsets.UTF_8);
        GraphQLSchema graphQLSchema = buildSchema(sdl);
        this.graphQL = GraphQL.newGraphQL(graphQLSchema).build();
        return this;
    }

    private GraphQLSchema buildSchema(String sdl)
    {
        TypeDefinitionRegistry typeRegistry = new SchemaParser().parse(sdl);
        RuntimeWiring runtimeWiring = buildWiring();
        SchemaGenerator schemaGenerator = new SchemaGenerator();
        return schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);
    }

    private RuntimeWiring buildWiring()
    {
        return RuntimeWiring.newRuntimeWiring()
            .type(newTypeWiring("Query")
                .dataFetcher(GraphQLSchemaDefinition.QUERY_NAME, mainGraphQLDataFetchers.searchForFileMetadataFetcher()))

            .build();
    }
}
