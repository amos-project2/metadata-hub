package HttpController;

import Config.Config;
import MetadataAutocompletion.MetadataAutocompletion;
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
import java.util.Arrays;
import java.util.List;

@Singleton
@Path("/api/metadata-autocomplete/")
public class MetadataAutocompletionController
{

    private final Config config;
    private final MetadataAutocompletion metadataAutocompletion;


    @Inject
    public MetadataAutocompletionController(Config config, MetadataAutocompletion metadataAutocompletion)
    {
        this.config = config;
        this.metadataAutocompletion = metadataAutocompletion;
    }





    @GET
    @Produces("application/json")
    @Path("/suggestions")
    public String getSuggestions(@QueryParam("q") String query) throws JsonProcessingException
    {
        System.out.println("Q =" + query);


        String[] split = query.split("\\$XXX\\$");
        String search = split[0].toLowerCase();
        String used = split[1].toLowerCase();
        String fileTypes = split[2].toUpperCase();

        List<String> result = metadataAutocompletion.request(Arrays.asList(fileTypes.split("\\$X\\$")), Arrays.asList(used.split("\\$x\\$")), search, 10);

//
//        ArrayList<String> list = new ArrayList<>();
//        list.add("bla");
//        list.add("blub");
//        list.add("test");

        String json = new ObjectMapper().writeValueAsString(result);
        System.out.println(json);
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
