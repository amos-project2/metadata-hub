package JerseyServer;

import graphql.GraphQL;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import java.io.IOException;
import java.net.URI;
import java.util.logging.Level;
import java.util.logging.Logger;

public class JerseyServer
{
    private static final URI BASE_URI = URI.create("http://localhost:8080/");

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
            System.out.println("WEB-GUI: http://localhost:8080");
            System.out.println("GRAPHQL-ENDPOINT: http://localhost:8080/graphql/?query=hey");
            System.out.println("GRAPHQL-TEST-CONSOLE: http://localhost:8080/testconsole/");

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
