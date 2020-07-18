package JerseyServer.HttpController;

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
public class WebUIController
{

    private final Config config;
    private final ClassPathFileLoader classPathFileLoader;

    @Inject
    public WebUIController(Config config, ClassPathFileLoader classPathFileLoader)
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



        /**
         *         ***** EXAMPLE *****
         *
         *         graphQLApi: "graphql/",
         *         serverApi: "api/",
         *         crawlerApi: "crawlerapi/",
         *         queryConstructorEnabled: true,
         *         crawlerEnabled:true,
         *         defaultUsername:"User",
         *         adminLoginEnabeled:true,
         *         enduserLoginEnabled:true,
         *         autoLogin:"",
         *         pageChangeAnimation:true,
         *         version: "1.0.0"
         */
        String content = out.toString();

        content = content.replaceAll("%graphQLApi%", "graphql/");
        content = content.replaceAll("%serverApi%", "api");
        content = content.replaceAll("%crawlerApi%", "crawlerapi/");

        System.out.println(config.getProperty("webui-queryConstructorEnabled"));


        content = content.replaceAll("%queryConstructorEnabled%", config.getProperty("webui-queryConstructorEnabled"));
        content = content.replaceAll("%crawlerEnabled%", config.getProperty("webui-crawlerEnabled"));
        content = content.replaceAll("%defaultUsername%", config.getProperty("webui-defaultUsername"));
        content = content.replaceAll("%adminLoginEnabeled%", config.getProperty("webui-adminLoginEnabeled"));
        content = content.replaceAll("%enduserLoginEnabled%", config.getProperty("webui-enduserLoginEnabled"));
        content = content.replaceAll("%autoLogin%", config.getProperty("webui-autoLogin"));
        content = content.replaceAll("%pageChangeAnimation%", config.getProperty("webui-pageChangeAnimation"));

        content = content.replaceAll("%version%", "1.0.0");

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
