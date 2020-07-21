package JerseyServer.HttpController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.Map;


@Singleton
@Path("/api/export/")
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
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Path("/download")
    public Response graphQLEndpointJsonInput(@FormParam("query") String query, @FormParam("query-included") String includeQuery) throws IOException
    {
        Map<String, Object> resultMap = this.graphQLController.graphQlExecutor(query, "");

        if (includeQuery.toLowerCase().trim().equals("true")) {
            resultMap.put("query", query);
        }

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(resultMap);


        Response.ResponseBuilder response = Response.ok(json);
        response.header("Content-Disposition","attachment; filename=\"MetadataExport.json\"");
        return response.build();

    }


}
