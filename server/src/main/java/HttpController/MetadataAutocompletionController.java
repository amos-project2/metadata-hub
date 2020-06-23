package HttpController;

import Config.Config;
import Utilities.ClassPathFileLoader;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

@Singleton
@Path("/api/metadata-autocomplete/")
public class MetadataAutocompletionController
{

    private final Config config;


    @Inject
    public MetadataAutocompletionController(Config config)
    {
        this.config = config;
    }





    @GET
    @Produces("application/json")
    @Path("/suggestions")
    public String getSuggestions(@QueryParam("q") String query) throws JsonProcessingException
    {
        System.out.println("Q =" + query);
        ArrayList<String> list = new ArrayList<>();
        list.add("bla");
        list.add("blub");
        list.add("test");

        String json = new ObjectMapper().writeValueAsString(list);
        return json;

    }


    @GET
    @Produces("application/json")
    @Path("/modal-suggestions")
    public String getModalSuggestions() throws JsonProcessingException
    {
        ArrayList<String> list = new ArrayList<>();
        list.add("hey1");
        list.add("hey2");
        list.add("hey3");

        String json = new ObjectMapper().writeValueAsString(list);
        return json;

    }




}
