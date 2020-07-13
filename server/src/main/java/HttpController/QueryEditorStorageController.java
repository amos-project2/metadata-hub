package HttpController;

import Database.Database;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;


@Singleton
@Path("/api/exportGraphQL/")
public class QueryEditorStorageController
{

    private static final Logger log = LoggerFactory.getLogger(QueryEditorStorageController.class);
    private final Database database;


    @Inject
    public QueryEditorStorageController(Database database)
    {

        this.database = database;
    }


    //TODO add methods

    @GET
    @Produces("application/json")
    @Path("/stub-method")
    public String clearCache()
    {
        return "";
    }



}
