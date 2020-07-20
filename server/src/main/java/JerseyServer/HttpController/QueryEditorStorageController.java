package JerseyServer.HttpController;

import Database.DatabaseException;
import QueryServices.StoreService.QueryEditorStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;


@Singleton
@Path("/api/query-storage/")
public class QueryEditorStorageController
{

    private static final Logger log = LoggerFactory.getLogger(QueryEditorStorageController.class);
    private final QueryEditorStorageService queryEditorStorageService;


    @Inject
    public QueryEditorStorageController(QueryEditorStorageService queryEditorStorageService)
    {
        this.queryEditorStorageService = queryEditorStorageService;
    }


    @GET
    @Produces("application/json")
    @Path("/get-all-stored-queries-metadata")
    public String getAllStoredQueriesMetadata() throws DatabaseException, IOException, SQLException
    {
        ObjectMapper mapper = new ObjectMapper();
        String data = mapper.writeValueAsString(this.queryEditorStorageService.getAllStoredQueriesMetadata());
        return data;
    }

    @GET
    @Produces("application/json")
    @Path("/get-stored-queries-metadata")
    public String getStoredQuery(@QueryParam("id") long id) throws DatabaseException, IOException, SQLException
    {
        ObjectMapper mapper = new ObjectMapper();
        String data = mapper.writeValueAsString(this.queryEditorStorageService.getStoredQuery(id));
        return data;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/store-query")
    public void storeQuery(String jsonData) throws DatabaseException, IOException, SQLException
    {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> map = mapper.readValue(jsonData, Map.class);

        String author = (String) map.get("author");
        String title = (String) map.get("title");

        ObjectMapper mapper2 = new ObjectMapper();
        String data = mapper2.writeValueAsString(map.get("data"));

        this.queryEditorStorageService.storeQuery(author, title, data);
    }

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Path("/delete-query")
    public void deleteQuery(@FormParam("id") long id) throws DatabaseException, IOException, SQLException
    {
        this.queryEditorStorageService.deleteQuery(id);
    }

    @POST
    @Path("/delete-all-query")
    public void deleteAllQuery() throws DatabaseException, IOException, SQLException
    {
        this.queryEditorStorageService.deleteAllQuery();
    }

}
