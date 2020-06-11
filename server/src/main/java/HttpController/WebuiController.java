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
import java.io.InputStream;

@Singleton
@Path("/")
public class WebuiController
{

    private final Config config;
    private final ClassPathFileLoader classPathFileLoader;

    @Inject
    public WebuiController(Config config, ClassPathFileLoader classPathFileLoader)
    {
        this.config = config;
        this.classPathFileLoader = classPathFileLoader;
    }

    private InputStream loadFromClassContext(String filePath)
    {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream(filePath);
        return is;
    }

    //START MAIN-RESSOURCES

    @GET
    @Produces({MediaType.TEXT_HTML})
    @Path("/")
    public String getIndexHtml() throws IOException
    {
        String out = this.classPathFileLoader.loadFile("web-ui/index.html");

        String content = out.toString().replaceAll("%PORT%", config.getProperty("server-port"));
        return content;
    }

    @GET
    @Produces({"application/javascript"})
    @Path("/bundle.js")
    public InputStream getBundleJs()
    {
        return this.loadFromClassContext("static-files/bundle.js");
    }

    @GET
    @Produces({"application/javascript"})
    @Path("/main.bundle.js")
    public InputStream getMainBundleJs()
    {
        return this.loadFromClassContext("static-files/main.bundle.js");
    }


    //End MAIN-RESSOURCES





}
