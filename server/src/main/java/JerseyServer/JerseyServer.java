package JerseyServer;

import Config.Config;
import Start.Start;
import graphql.GraphQL;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.core.UriBuilder;
import java.io.IOException;
import java.net.URI;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

//@RequiredArgsConstructor
public class JerseyServer
{
    private final GraphQL graphQL;

    private Config config;
    private static URI BASE_URI;
    private final ResourceConfig resourceConfig;
    private final HttpServer server;

    @Getter
    private static GraphQL graphQLCheat;

    public JerseyServer(GraphQL graphQl, Config config)
    {
        this.config = config;
        BASE_URI = UriBuilder.fromUri("http://" + config.getProperty("httpserver.address") + "/")
            .port(Integer.parseInt(config.getProperty("httpserver.port"))).build();
        this.graphQL = graphQl;
        resourceConfig = new ResourceConfig(MainController.class);
        resourceConfig.register(ErrorHandler.class);
        this.server = GrizzlyHttpServerFactory.createHttpServer(BASE_URI, resourceConfig, false);
    }

    public void start()
    {
        if (graphQLCheat != null) throw new RuntimeException("Server is/was already started");
        graphQLCheat = graphQL;

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
            System.out.println("Listening-Address: " + config.getProperty("httpserver.address") + " | Port: " + config.getProperty("httpserver.port"));
            System.out.println("WEB-GUI: http://localhost:" + config.getProperty("httpserver.port"));
            System.out.println("GRAPHQL-ENDPOINT: http://localhost:" + config.getProperty("httpserver.port") + "/graphql/?query=hey");
            System.out.println("GRAPHQL-TEST-CONSOLE: http://localhost:" + config.getProperty("httpserver.port") + "/testconsole/");

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
