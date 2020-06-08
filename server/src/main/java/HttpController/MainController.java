package HttpController;

import com.fasterxml.jackson.core.JsonProcessingException;

import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.io.InputStream;

@Path("/")
public interface MainController
{
	@POST
	@Produces("application/json")
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/graphql")
	String graphQLEndpointJsonInput(String jsonData) throws IOException;

	@POST
	@Produces("application/json")
	@Path("/graphql")
	String graphQLEndpointTextInput(String bodyData) throws IOException;

	@GET
	@Produces("application/json")
	@Path("/graphql")
	String graphQLEndpointGetInput(@QueryParam("query") String queryData) throws IOException;

	String graphQlEndpoint(String query, String variables) throws JsonProcessingException;

	@GET
	@Produces({MediaType.TEXT_HTML})
	@Path("/testconsole")
	String getTestConsole() throws IOException;

	@GET
	@Produces("text/plain")
	@Path("/error1")
	String getError1();

	@GET
	@Produces("text/plain")
	@Path("/error2")
	String getError2() throws Exception;

	@GET
	@Produces({MediaType.TEXT_HTML})
	@Path("/")
	String getIndexHtml() throws IOException;

	@GET
	@Produces({"application/javascript"})
	@Path("/bundle.js")
	InputStream getBundleJs() throws IOException;

	@GET
	@Produces({"application/javascript"})
	@Path("/main.bundle.js")
	InputStream getMainBundleJs() throws IOException;
}
