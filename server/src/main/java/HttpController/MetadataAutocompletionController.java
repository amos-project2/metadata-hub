package HttpController;

import Config.Config;
import MetadataAutocompletion.MetadataAutocompletionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Singleton
@Path("/api/metadata-autocomplete/")
public class MetadataAutocompletionController
{

    private final Config config;
    private final MetadataAutocompletionService metadataAutocompletionService;


    @Inject
    public MetadataAutocompletionController(Config config, MetadataAutocompletionService metadataAutocompletionService)
    {
        this.config = config;
        this.metadataAutocompletionService = metadataAutocompletionService;
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

        List<String> result = metadataAutocompletionService.request(Arrays.asList(fileTypes.split("\\$X\\$")), Arrays.asList(used.split("\\$x\\$")), search, 10);

        String json = new ObjectMapper().writeValueAsString(result);
        System.out.println(json);
        return json;

    }


    @GET
    @Produces("application/json")
    @Path("/modal-suggestions")
    public String getModalSuggestions(@QueryParam("fileTypes") String fileTypesString) throws JsonProcessingException
    {
        String[] fileTypes = fileTypesString.toUpperCase().split("\\$X\\$");

        List<String> result = metadataAutocompletionService.request(Arrays.asList(fileTypes), new ArrayList<>(), null, 20);

        String json = new ObjectMapper().writeValueAsString(result);
        System.out.println(json);
        return json;

    }


}
