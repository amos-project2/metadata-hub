package JerseyServer.Impl;

import Start.Start;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class ErrorHandler implements ExceptionMapper<Throwable>
{
    private static final Logger log = LoggerFactory.getLogger(Start.class);

		public Response toResponse(Throwable error)
		{
		    log.info(error.getMessage());
			error.printStackTrace();

			if (error instanceof WebApplicationException)
			{
				return ((WebApplicationException) error).getResponse();
			}
			else
			{
				return Response.serverError().build();
			}
		}
	}
