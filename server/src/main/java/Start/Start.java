package Start;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;


public class Start
{
    private static final Logger log = LoggerFactory.getLogger(Start.class);
    @Getter private static Properties config;

    public static void main(String[] args) throws Exception
    {
        System.out.println("AMOS-GRAPHQL-SERVER");
        if (!createdConfig(args)) return;

        Registry registry = new Registry();

        RuntimeTests runtimeTests = new RuntimeTests(registry);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();


        System.out.println("all services are started");
    }

    public static boolean createdConfig(String[] args) {
        //Config Stuff:
        ApplicationConfig applicationConfig = new ApplicationConfig((args.length > 0) ? args[0] : null);
        if (!applicationConfig.isConfigValid())
        {
            System.out.println("Config is not valide: " + applicationConfig.getErrorMessage());
            System.exit(-1);
            return false;
        }
        Start.config = applicationConfig.getConfig();
        //End Config Stuff
        return true;
    }


}
