package HttpController;

import Config.Config;
import Utilities.ClassPathFileLoader;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

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
    @Path("/vendor.bundle.js")
    public InputStream getMainBundleJs()
    {
        return this.loadFromClassContext("static-files/vendor.bundle.js");
    }


    //End MAIN-RESSOURCES

    @GET
    @Produces("image/png")
    @Path("/logo.png")
    public StreamingOutput getLogo()
    {
        System.out.println("hier drinnen");
        InputStream inputStream = this.loadFromClassContext("web-ui/logo.png");

        System.out.println(inputStream);

        return new StreamingOutput()
        {
            @Override
            public void write(OutputStream outputStream) throws IOException, WebApplicationException
            {
                System.out.println(inputStream);
                System.out.println(outputStream);
                inputStream.transferTo(outputStream);
            }
        };

//        Response.ResponseBuilder response = Response.ok(inputStream);
//        response.header("Content-Disposition",
//            "attachment; filename=logo.png");
//        return response.build();
    }



}
