package JerseyServer;

import Start.Start;
import graphql.GraphQL;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.core.UriBuilder;
import java.io.IOException;
import java.net.URI;
import java.util.logging.Level;
import java.util.logging.Logger;

public class JerseyServer
{
    //private static final URI BASE_URI = URI.create("http://localhost:8080/");
    private static final URI BASE_URI = UriBuilder.fromUri("http://"+ Start.config.get("httpserver.address")+"/").port(Integer.parseInt(Start.config.getProperty("httpserver.port"))).build();


    private final ResourceConfig resourceConfig = new ResourceConfig(MainController.class);
    private final HttpServer server = GrizzlyHttpServerFactory.createHttpServer(BASE_URI, resourceConfig, false);
    private final GraphQL graphQL;

    private static GraphQL graphQLDependencyInjectionCheat;

    public JerseyServer(GraphQL graphQL)
    {
        this.graphQL = graphQL;
    }

    public static GraphQL getGraphQLCheat()
    {
        return JerseyServer.graphQLDependencyInjectionCheat;
    }


    public void start()
    {
        if (JerseyServer.graphQLDependencyInjectionCheat != null) throw new RuntimeException("Server is/was already started");
        JerseyServer.graphQLDependencyInjectionCheat = graphQL;

        try
        {
            System.out.println("Jersey-Server is starting");

            Runtime.getRuntime().addShutdownHook(new Thread(new Runnable()
            {
                @Override
                public void run()
                {
                    server.shutdownNow();
                }
            }));
            server.start();


            System.out.println("Jersey-Server started\n");
            System.out.println("Listening-Address: " + Start.config.get("httpserver.address")+ " | Port: "+Start.config.get("httpserver.port"));
            System.out.println("WEB-GUI: http://localhost:"+Start.config.get("httpserver.port"));
            System.out.println("GRAPHQL-ENDPOINT: http://localhost:"+Start.config.get("httpserver.port")+"/graphql/?query=hey");
            System.out.println("GRAPHQL-TEST-CONSOLE: http://localhost:"+Start.config.get("httpserver.port")+"/testconsole/");

            Thread.currentThread().join();
        }
        catch (IOException | InterruptedException ex)
        {
            Logger.getLogger(JerseyServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void shutdown()
    {
        this.server.shutdown();
    }

    public void shutdownNow()
    {
        this.server.shutdownNow();
    }
}
