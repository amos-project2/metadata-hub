package JerseyServer;

import Start.Start;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.ExecutionResult;
import graphql.GraphQL;

import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.*;
import java.util.Map;
import java.util.Properties;

@Path("/")
@Singleton
public class MainController
{
    private final GraphQL graphQl;
    private static final Properties config = Start.getConfig();

    public MainController()
    {
        System.out.println("graphQL added: " + (JerseyServer.getGraphQLCheat() != null));
        this.graphQl = JerseyServer.getGraphQLCheat();
    }

    //static-stuff

    @GET
    @Produces("text/plain")
    @Path("/")
    public String getStatic1()
    {
        return "static data";
    }


    //graphQL-Endpoint

    @POST
    @Produces("application/json")
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/graphql")
    public String graphQLEndpointJsonInput(String jsonData) throws IOException
    {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> map = mapper.readValue(jsonData, Map.class);
        System.out.println(map.get("query"));
        System.out.println(map.get("variables"));

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
    public String graphQLEndpointGetInput(@QueryParam("query") String queryData) throws IOException
    {
        String query = queryData == null ? "" : queryData;
        String variables = "";

        return this.graphQlEndpoint(query, variables);
    }


    public String graphQlEndpoint(String query, String variables) throws JsonProcessingException
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

        String json = new ObjectMapper().writeValueAsString(execute.toSpecification());
        //List<GraphQLError> errors = execute.getErrors();
        return json;
    }

    //graphQL-debugging-console

    @GET
    @Produces({MediaType.TEXT_HTML})
    @Path("/testconsole")
    public String getTestConsole() throws IOException
    {

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        StringBuilder out = new StringBuilder();
        try(InputStream is = classloader.getResourceAsStream("graphiql/graphiql.html");
        InputStreamReader isr=new InputStreamReader(is);// im not sure if we can use this directly in the constructor of Buffered Reader, with try-with TODO research
        BufferedReader reader = new BufferedReader(isr);)
        {
            String line;
            while ((line = reader.readLine()) != null)
            {
                out.append(line);
            }
        }

        String content = out.toString().replaceAll("%PORT%", config.getProperty("httpserver.port"));
        return content;
    }

}
