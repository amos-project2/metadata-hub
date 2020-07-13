package HttpController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.Map;


@Singleton
@Path("/api/exportGraphQL/")
public class ExportController
{

    private static final Logger log = LoggerFactory.getLogger(ExportController.class);
    private final GraphQLController graphQLController;


    @Inject
    public ExportController(GraphQLController graphQLController)
    {
        this.graphQLController = graphQLController;
    }

    @POST
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/download")
    public String graphQLEndpointJsonInput(String jsonData) throws IOException
    {
       //TODO
        return "";
    }




}
