package HelloWorld.GraphQLServer;

import Database.DatabaseProvider;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import graphql.GraphQL;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;


import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;


public class GraphQLProvider
{
    private final GraphQLDataFetchers graphQLDataFetchers;
    private final DatabaseProvider databaseProvider;
    private GraphQL graphQL;

    public GraphQL graphQL()
    {
        return graphQL;
    }

    public GraphQLProvider(GraphQLDataFetchers graphQLDataFetchers, DatabaseProvider databaseProvider)
    {
        this.graphQLDataFetchers = graphQLDataFetchers;
        this.databaseProvider = databaseProvider;
    }

    //its good to use a init, because calling object-methods, since the object is not ready constructed
    //is due different reasons not a so good idea
    public GraphQLProvider init() throws IOException
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
                .dataFetcher("knockknock", graphQLDataFetchers.getGreetingFetcher()))
            .build();
    }
}
