package Start;

import JerseyServer.JerseyServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class Start
{
    private static final Logger logger = LoggerFactory.getLogger(Start.class);

    public static void main(String[] args)
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        JerseyServer jerseyServer = new JerseyServer();
        jerseyServer.start();

        System.out.println("all services are started");
    }
}
