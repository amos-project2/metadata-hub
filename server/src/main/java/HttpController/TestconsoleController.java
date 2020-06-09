package HttpController;

import Config.Config;
import Utilities.ClassPathFileLoader;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.io.IOException;

@Singleton
@Path("/")
public class TestconsoleController
{
    private final Config config;
    private final ClassPathFileLoader classPathFileLoader;

    @Inject
    public TestconsoleController(Config config, ClassPathFileLoader classPathFileLoader)
    {
        this.config = config;
        this.classPathFileLoader = classPathFileLoader;
    }

    @GET
    @Produces({MediaType.TEXT_HTML})
    @Path("/testconsole")
    public String getTestConsole() throws IOException
    {
        String out = this.classPathFileLoader.loadFile("graphiql/graphiql.html");

        String content = out.toString().replaceAll("%PORT%", config.getProperty("server-port"));
        return content;
    }

}
