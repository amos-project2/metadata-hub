package Start;

import Config.ApplicationConfig;
import Config.JsonValideException;
import Config.Config;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;


public class Start
{
    private static final Logger log = LoggerFactory.getLogger(Start.class);
    public static boolean isIntegrationTest = false;
    @Getter private static Config config;

    public static void main(String[] args) throws Exception
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        final CLIParser cliParser = new CLIParser(args).parse();
        Start.isIntegrationTest = cliParser.isIntegrationTest();
        System.out.println(Start.isIntegrationTest + " integration-test");

        if ((config = ApplicationConfig.loadConfig(cliParser.getConfigFilePath())) == null)
        {
            System.exit(-1);
            return;
        }

        Registry registry = new Registry();


        //this is not related to our integration-tests
        RuntimeTests runtimeTests = new RuntimeTests(registry);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();


        System.out.println("all services are started");


        if (Start.isIntegrationTest)
        {
            IntegrationTest integrationTest = new IntegrationTest(registry);
            boolean result = integrationTest.testAll();

            registry.shutdown();

            if (result)
            {
                System.out.println("Integrationtest succeeded!");
                System.exit(0);
                return;
            }
            else
            {
                System.out.println("Integrationtest failed!");
                System.exit(-1);
                return;
            }

        }

        Thread.currentThread().join();

    }


}
