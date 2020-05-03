package JerseyServer;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

@Path("/")
public class MainController
{

    //static-stuff

    @GET
    @Produces("text/plain")
    @Path("/")
    public String getHello()
    {
        return "static data";
    }

    //...


    //graphQL-Endpoint

    @POST
    @Produces("application/json")
    @Path("/graphql")
    public String graphQLEndpoint()
    {
        //here we can
        return "hello";
    }

    //graphQL-debugging-console

    @GET
    @Produces({MediaType.TEXT_HTML})
    @Path("/testconsole")
    public FileInputStream getTestConsole() throws FileNotFoundException
    {
        try
        {
//            File f = new File("graphiql/graphiql.html");
            File f = new File(getClass().getClassLoader().getResource("graphiql/graphiql.html").getFile());
            return new FileInputStream(f);
        }
        catch (FileNotFoundException e)
        {
            e.printStackTrace();
            throw e;
        }
    }

}
