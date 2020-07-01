package HttpController;

import Config.Config;
import MetadataAutocompletion.FileTypeAutocompletionService;
import MetadataAutocompletion.MetadataAutocompletionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.*;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Singleton
@Path("/api/metadata-autocomplete/")
public class MetadataAutocompletionController
{

    private final Config config;
    private final MetadataAutocompletionService metadataAutocompletionService;
    private final FileTypeAutocompletionService fileTypeAutocompletionService;


    @Inject
    public MetadataAutocompletionController(Config config,
                                            MetadataAutocompletionService metadataAutocompletionService,
                                            FileTypeAutocompletionService fileTypeAutocompletionService)
    {
        this.config = config;
        this.metadataAutocompletionService = metadataAutocompletionService;
        this.fileTypeAutocompletionService = fileTypeAutocompletionService;
    }

    @GET
    @Produces("application/json")
    @Path("/datatype")
    public String getMetadataDatatype(@QueryParam("q") String query) throws JsonProcessingException
    {
        System.out.println("Datatype Query =" + query);

        String[] split = query.split("\\$XXX\\$");
        String metadataTag = split[0].trim();

        //Default value if no file type is used
        String fileTypes = "JPEG";
        if(split.length > 1){
            fileTypes = split[1].toUpperCase().trim();
        }
        System.out.println("getMetadata:  tag: " + metadataTag + " fileTypes: " + fileTypes);

        String datatype = metadataAutocompletionService.getMetadataDatatype(this.createList(fileTypes,true), metadataTag);

        String json = new ObjectMapper().writeValueAsString(datatype);
        System.out.println("Returned Datatype: " + json);
        return json;
    }

    @GET
    @Produces("application/json")
    @Path("/suggestions")
    public String getSuggestions(@QueryParam("q") String query) throws JsonProcessingException
    {
        System.out.println("Q =" + query);


        String[] split = query.split("\\$XXX\\$");
        String search = split[0].toLowerCase().trim();
        String used = split[1].toLowerCase().trim();
        String fileTypes = split[2].toUpperCase().trim();

        List<String> result = metadataAutocompletionService.request(this.createList(fileTypes,true), this.createList(used), search, 10, false);

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

        List<String> result = metadataAutocompletionService.request(Arrays.asList(fileTypes), new ArrayList<>(), null, 20, false);

        String json = new ObjectMapper().writeValueAsString(result);
        System.out.println(json);
        return json;

    }


    @GET
    @Produces("application/json")
    @Path("/filetype-suggestions")
    public String getFilytypeSuggestions(@QueryParam("q") String query) throws JsonProcessingException, SQLException
    {
        System.out.println("Q =" + query);

        String[] split = query.split("\\$XXX\\$");
        String search = split[0].toLowerCase().trim();
        String used = split[1].toLowerCase().trim();

        List<String> result = fileTypeAutocompletionService.getFileTypes(this.createList(used), search, 10);

        String json = new ObjectMapper().writeValueAsString(result);
        System.out.println(json);
        return json;

    }


    private List<String> createList(String data)
    {
        return createList(data, false);
    }

    private List<String> createList(String data, boolean bigX)
    {
        String x = "x";
        if (bigX) x = "X";
        return (data.equals("")) ? new ArrayList<>() : Arrays.asList(data.split("\\$" + x + "\\$"));
    }


}
