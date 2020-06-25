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
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;

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
    }

    @GET
    @Produces("application/json")
    @Path("{part: .*}")
    public Response crawlerGet(@PathParam("part") String path, @Context UriInfo uriInfo) throws UnsupportedEncodingException
    {
        return this.crawlerGetAndPost(path, uriInfo, null);
    }

    @POST
    @Produces("application/json")
    @Path("/{part: .*}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response crawlerPost(@PathParam("part") String path, @Context UriInfo uriInfo, MultivaluedMap<String, String> form) throws UnsupportedEncodingException
    {
        System.out.println(form.toString());
        return this.crawlerGetAndPost(path, uriInfo, form);
    }


    public Response crawlerGetAndPost(String path, UriInfo uriInfo, MultivaluedMap<String, String> form) throws UnsupportedEncodingException
    {

        MultivaluedMap<String, String> parameters = uriInfo.getQueryParameters();
        WebTarget webTarget = target.path(path);

        for (String value : parameters.keySet()){
            if(parameters.getFirst(value) !=null)
            {
                webTarget=webTarget.queryParam(value, URLEncoder.encode(parameters.getFirst(value), "UTF-8").replaceAll("\\+", "%20"));
                System.out.println("value -> " + value + " | key -> " + parameters.getFirst(value));
            }


        }

        //TODO fix it! webtarget is inmutaable
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
