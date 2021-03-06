package JerseyServer.HttpController;

import Config.Config;
import Database.DatabaseException;
import GraphQL.Fetcher.QueryCache;
import QueryServices.MetadataAutocompletion.FileTypeAutocompletionService;
import QueryServices.MetadataAutocompletion.MetadataInfoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Used by the WebUI to give suggestions and validate entries in the FormQuery based on the metadata in the database.
 */
@Singleton
@Path("/api/metadata-autocomplete/")
public class WebUIMetadataHelperController
{

    private static final Logger log = LoggerFactory.getLogger(WebUIMetadataHelperController.class);

    private final Config config;
    private final MetadataInfoService metadataInfoService;
    private final FileTypeAutocompletionService fileTypeAutocompletionService;
    private final QueryCache queryCache;

    @Inject
    public WebUIMetadataHelperController(Config config,
                                         MetadataInfoService metadataInfoService,
                                         FileTypeAutocompletionService fileTypeAutocompletionService,
                                         QueryCache queryCache)
    {
        this.config = config;
        this.metadataInfoService = metadataInfoService;
        this.fileTypeAutocompletionService = fileTypeAutocompletionService;
        this.queryCache = queryCache;
    }

    @GET
    @Produces("application/json")
    @Path("/datatype")
    public String getTagDataType(@QueryParam("q") String query) throws JsonProcessingException
    {
        log.info("Tag Datatype Query :" + query);

        String[] split = query.split("\\$XXX\\$");
        String metadataTag = split[0].trim();

        // Default value if no file type is used
        String fileTypes = "ALL";
        if (split.length > 1)
        {
            fileTypes = split[1].toUpperCase().trim();
        }

        String tagDatatype = metadataInfoService.requestTagDataType(this.createList(fileTypes, true), metadataTag);

        String json = new ObjectMapper().writeValueAsString(tagDatatype);
        log.info("Returned Datatype: " + json);
        return json;
    }

    @GET
    @Produces("application/json")
    @Path("/suggestions")
    public String getTagSuggestions(@QueryParam("q") String query) throws JsonProcessingException
    {
        log.info("Tag Suggestions Query :" + query);


        String[] split = query.split("\\$XXX\\$");
        String searchString = split[0].toLowerCase().trim();
        String usedTags = split[1].toLowerCase().trim();
        String usedFileTypes = split[2].toUpperCase().trim();

        List<String> tagSuggestions = metadataInfoService.requestTagSuggestions(this.createList(usedFileTypes, true), this.createList(usedTags), searchString, 10, false);

        String jsonTagSuggestions = new ObjectMapper().writeValueAsString(tagSuggestions);
        log.info("Tag Suggestions: " + jsonTagSuggestions);
        return jsonTagSuggestions;

    }


    @GET
    @Produces("application/json")
    @Path("/modal-suggestions")
    public String getModalTagSuggestions(@QueryParam("limit") long limit, @QueryParam("offset") long offset, @QueryParam("fileTypes") String fileTypes) throws JsonProcessingException
    {
        log.info("Modal Tag Suggestions Query :" + fileTypes + " limit: " + limit + " offset: " + offset);
        List<String> usedFileTypes = this.createList(fileTypes.toUpperCase().trim(), true);

        List<String> tagSuggestions = metadataInfoService.requestTagSuggestions(usedFileTypes, limit, offset);

        String jsonTagSuggestions = new ObjectMapper().writeValueAsString(tagSuggestions);
        log.info("Modal Tag Suggestions: " + jsonTagSuggestions);
        return jsonTagSuggestions;

    }


    @GET
    @Produces("application/json")
    @Path("/filetype-suggestions")
    public String getFileTypeSuggestions(@QueryParam("q") String query) throws JsonProcessingException, SQLException, DatabaseException
    {
        log.info("File Type Suggestions Query :" + query);

        String[] split = query.split("\\$XXX\\$");
        String searchString = split[0].toLowerCase().trim();
        String usedFileTypes = split[1].toLowerCase().trim();
        List<String> usedFileTypesList = this.createList(usedFileTypes);
        List<String> fileTypeSuggestions = fileTypeAutocompletionService.getFileTypes(usedFileTypesList, searchString, 10);

        String jsonFileTypeSuggestions = new ObjectMapper().writeValueAsString(fileTypeSuggestions);
        log.info("File Type Suggestions: " + jsonFileTypeSuggestions);
        return jsonFileTypeSuggestions;

    }


    //TODO maybe move to a own controller, because its not anymore still autocompletion related
    @GET
    @Produces("application/json")
    @Path("/clear-cache")
    public String clearCache()
    {
        log.info("clear-cache");
        this.metadataInfoService.cleanCache();
        this.queryCache.clearCache();
        return "";
    }


    private List<String> createList(String data)
    {
        return createList(data, false);
    }

    private List<String> createList(String data, boolean bigX)
    {
        String x = "x";
        if (bigX) x = "X";
        List<String> ret = (data.equals("")) ? new ArrayList<String>() : new LinkedList<>(Arrays.asList(data.split("\\$" + x + "\\$")));
        return ret.stream().map(s -> s.trim()).collect(Collectors.toList());
    }


}
