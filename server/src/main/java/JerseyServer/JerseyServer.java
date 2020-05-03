package JerseyServer;

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

    public void start()
    {
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

            System.out.println("Application started. Try out.\n");
            System.out.println("WEB-GUI: http://localhost:8080");
            System.out.println("GRAPHQL-ENDPOINT: http://localhost:8080/graphql/");
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
