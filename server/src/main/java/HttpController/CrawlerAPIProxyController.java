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
 * This controller is for proxying the crawler-API
 *
 */
@Path("crawlerapi")
@Singleton
public class CrawlerAPIProxyController
{
    private final WebTarget target;
    private final Config config;

    @Inject
    public CrawlerAPIProxyController(Config config)
    {
        this.config = config;
        Client client = ClientBuilder.newClient();
        target = client.target("http://localhost:" + config.getProperty("crawler-port"));
    }

    @GET
    @Produces("application/json")
    @Path("{part: .*}")
    public Response crawlerGet(@PathParam("part") String path, @Context UriInfo uriInfo)
    {
        return this.crawlerGetAndPost(path, uriInfo, null);
    }

    @POST
    @Produces("application/json")
    @Path("/{part: .*}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response crawlerPost(@PathParam("part") String path, @Context UriInfo uriInfo, MultivaluedMap<String, String> form)
    {
        System.out.println(form.toString());
        return this.crawlerGetAndPost(path, uriInfo, form);
    }


    public Response crawlerGetAndPost(String path, UriInfo uriInfo, MultivaluedMap<String, String> form)
    {

        MultivaluedMap<String, String> parameters = uriInfo.getQueryParameters();
        WebTarget webTarget = target.path(path);
        parameters.forEach((key, values) ->
        {
            System.out.println(values+ "GET "+ key);//for debugging
            webTarget.queryParam(key, values.toArray());
        });

        //for debuggingwas
        if(form != null)
        {
            form.forEach((key, values) ->
            {
                System.out.println(values + "POST " + key);
            });
        }


        Response response;
        if (form == null)
        {
            response = webTarget.request().get();
        }
        else
        {
            response = webTarget.request().post(Entity.form(form));
        }

        return response;
    }
}
