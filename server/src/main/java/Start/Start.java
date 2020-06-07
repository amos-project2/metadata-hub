package Start;

import Config.ApplicationConfig;

import Config.Config;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


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

        DependenciesContainer dependenciesContainer = new DependenciesContainer(config);
        ApplicationService applicationService = dependenciesContainer.getInjector().getInstance(ApplicationService.class);
        applicationService.startAll();


        //Registry registry = new Registry();


        //this is not related to our integration-tests
        RuntimeTests runtimeTests = new RuntimeTests(dependenciesContainer);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();


        System.out.println("all services are started");

        //new BenchmarkTest(registry).doBenchmark();


        if (Start.isIntegrationTest)
        {
            IntegrationTest integrationTest = new IntegrationTest(dependenciesContainer);
            boolean result = integrationTest.testAll();

            //registry.shutdown();
            applicationService.shutdownAll();

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
