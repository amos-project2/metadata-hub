package JerseyServer.HttpController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import graphql.ExecutionResult;
import graphql.GraphQL;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.Map;

@Singleton
@Path("/")
public class GraphQLController
{
    private final GraphQL graphQl;

    @Inject
    public GraphQLController(GraphQL graphQl)
    {
        this.graphQl = graphQl;
    }


    @POST
    @Produces("application/json")
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/graphql")
    public String graphQLEndpointJsonInput(String jsonData) throws IOException
    {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> map = mapper.readValue(jsonData, Map.class);

        String query = map.get("query");
        String variables = map.get("variables");

        //its ok, doing that so, cause the compilzer optimze the second allocation away
        query = query == null ? "" : query;
        variables = variables == null ? "" : variables;

        return this.graphQlEndpoint(query, variables);
    }

    @POST
    @Produces("application/json")
    @Path("/graphql")
    public String graphQLEndpointTextInput(String bodyData) throws IOException
    {
        String query = bodyData == null ? "" : bodyData;
        String variables = "";

        return this.graphQlEndpoint(query, variables);
    }

    @GET
    @Produces("application/json")
    @Path("/graphql")
    public String graphQLEndpointGetInput(@QueryParam("query") String queryData, @QueryParam("variables") String variables) throws IOException
    {
        String query = queryData == null ? "" : queryData;
        variables = variables == null ? "" : variables;

        return this.graphQlEndpoint(query, variables);
    }

    public String graphQlEndpoint(String query, String variables) throws JsonProcessingException
    {
        Map<String, Object> resultMap = this.graphQlExecutor(query, variables);

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(resultMap);
//      List<GraphQLError> errors = execute.getErrors();

        return json;
    }

    public Map<String, Object> graphQlExecutor(String query, String variables)
    {
        ExecutionResult execute;

        if (variables != null)
        {
            execute = this.graphQl.execute(query, null, variables);
        }
        else
        {
            execute = this.graphQl.execute(query);
        }
        return execute.toSpecification();
    }


}
