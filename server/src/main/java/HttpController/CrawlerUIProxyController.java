package HttpController;

import Config.Config;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.*;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.*;

/**
 *
 * This controller is for proxying the crawler-webui
 * Maybe we dont need this later
 *
 */
@Path("crawlerui")
@Singleton
public class CrawlerUIProxyController
{
    private final WebTarget target;
    private final Config config;

    @Inject
    public CrawlerUIProxyController(Config config)
    {
        this.config = config;
        Client client = ClientBuilder.newClient();
        target = client.target("http://localhost:" + config.getProperty("crawler-port"));
    }

    @GET
    @Path("{part: .*}")
    public Response crawlerGet(@PathParam("part") String path, @Context UriInfo uriInfo)
    {
        return this.crawlerGetAndPost(path, uriInfo, null);
    }

    @POST
    @Path("/{part: .*}")
    //@Consumes({MediaType.APPLICATION_JSON,MediaType.APPLICATION_FORM_URLENCODED})
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response crawlerPost(@PathParam("part") String path, @Context UriInfo uriInfo, MultivaluedMap<String, String> form)
    {
        System.out.println(form.toString());
        return this.crawlerGetAndPost(path, uriInfo, form);
    }


    public Response crawlerGetAndPost(String path, UriInfo uriInfo, MultivaluedMap<String, String> form)
    {
       // System.out.println(path + " PAAAATH");
        MultivaluedMap<String, String> parameters = uriInfo.getQueryParameters();

        WebTarget webTarget = target.path(path);
        parameters.forEach((key, values) ->
        {
           // System.out.println(key + "-> " + values.toString());
            target.queryParam(key, values.toArray());
        });

       // System.out.println(target.getUri() + "blablub");

        Response response;
        if (form == null)
        {
            response = webTarget.request().get();
        }
        else
        {
            response = webTarget.request().post(Entity.form(form));
        }

        String pathNormalized = path.trim().replace("/", "").toLowerCase();
       // System.out.println(pathNormalized + " path2");
        //System.out.println(response.getStatusInfo());
        //System.out.println(response.getStatusInfo().toEnum() == Response.Status.OK);
       // System.out.println(pathNormalized.equals("config"));

        if (response.getStatusInfo().toEnum() == Response.Status.OK && pathNormalized.equals("config"))
        {
            //System.out.println("hier drinnen");
            return this.mainPageLoad(response);
        }


        return response;

    }

    private Response mainPageLoad(Response response)
    {
        String content = response.readEntity(String.class);
        content = content.replaceAll("\"/", "\"");
       // System.out.println(content);
        return Response.ok(content, MediaType.TEXT_HTML).build();

    }
}
