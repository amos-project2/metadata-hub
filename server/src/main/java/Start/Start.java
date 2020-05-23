package Start;

import Config.ApplicationConfig;
import Config.JsonValideException;
import Config.Config;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;


public class Start
{
    private static final Logger log = LoggerFactory.getLogger(Start.class);
    @Getter private static Config config;

    public static void main(String[] args) throws Exception
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        if (!loadConfig(args))
        {
            System.exit(-1);
            return;
        }


        Registry registry = new Registry();

        RuntimeTests runtimeTests = new RuntimeTests(registry);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();


        System.out.println("all services are started");
    }

    private static boolean loadConfig(String[] args) throws IOException, JsonValideException
    {
        try
        {
            Map<String, String> env = System.getenv();
            ApplicationConfig applicationConfig = new ApplicationConfig((args.length > 0) ? args[0] : null, env.get("METADATAHUB_SERVER_CONFIG"));

            if (!applicationConfig.isConfigValid())
            {
                System.out.println("Config (" + applicationConfig.getConfigFilePath() + ") is not valide: " + applicationConfig.getErrorMessage());
                return false;
            }
            Start.config = applicationConfig.getConfig();
            System.out.println("Used config-file: " + applicationConfig.getConfigFilePath() + " [" + ((applicationConfig.isJson()) ? "JSON" : "PROPERTY-FILE") + "]");
            return true;
        }
        catch (Exception e)
        {
            e.printStackTrace();
            System.out.println("Error in loading the config: " + e.getMessage());
            return false;
        }

    }


}
