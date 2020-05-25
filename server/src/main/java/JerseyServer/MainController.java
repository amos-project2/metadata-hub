package JerseyServer;

import Config.Config;
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
    private static final Config config = Start.getConfig();

    public MainController()
    {
        System.out.println("graphQL added: " + (JerseyServer.getGraphQLCheat() != null));
        this.graphQl = JerseyServer.getGraphQLCheat();
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
        String out = this.loadFile("graphiql/graphiql.html");

        String content = out.toString().replaceAll("%PORT%", config.getProperty("httpserver.port"));
        return content;
    }


    //for testing purposes:

    @GET
    @Produces("text/plain")
    @Path("/error1")
    public String getError1()
    {
        throw new WebApplicationException("error 1", 403);
    }

    @GET
    @Produces("text/plain")
    @Path("/error2")
    public String getError2() throws Exception
    {
        //a none WebApplicationException, the message here may not be propagated to the client
        throw new Exception("error2");
    }


    //web-ui-output


    @GET
    @Produces({MediaType.TEXT_HTML})
    @Path("/")
    public String getIndexHtml() throws IOException
    {
        String out = this.loadFile("web-ui/index.html");

        String content = out.toString().replaceAll("%PORT%", config.getProperty("httpserver.port"));
        return content;
    }

    @GET
    @Produces({"application/javascript"})
    @Path("/bundle.js")
    public InputStream getBundleJs() throws IOException
    {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream("static-files/bundle.js");
        return is;
    }

    @GET
    @Produces({"application/javascript"})
    @Path("/main.bundle.js")
    public InputStream getMainBundleJs() throws IOException
    {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream("static-files/main.bundle.js");
        return is;
    }






    private String loadFile(String fileName) throws IOException
    {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        StringBuilder out = new StringBuilder();
        try (InputStream is = classloader.getResourceAsStream(fileName);
             InputStreamReader isr = new InputStreamReader(is);// im not sure if we can use this directly in the constructor of Buffered Reader, with try-with TODO research
             BufferedReader reader = new BufferedReader(isr);)
        {
            String line;
            while ((line = reader.readLine()) != null)
            {
                out.append(line);
            }
        }


        return out.toString();
    }

}
