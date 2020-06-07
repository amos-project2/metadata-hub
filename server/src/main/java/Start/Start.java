package Start;

import Config.ApplicationConfig;

import Config.Config;
import Config.ConfigModule;
import Database.DatabaseModule;
import GraphQL.GraphQLModule;
import JerseyServer.HttpServerModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import graphql.GraphQL;
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

        Injector injector = Guice.createInjector(
            new ConfigModule(config),
            new DatabaseModule(),
            new GraphQLModule(),
            new HttpServerModule());
        DatabaseModule instance = injector.getInstance(DatabaseModule.class);
        GraphQL instance2 = injector.getInstance(GraphQL.class);


        Registry registry = new Registry();


        //this is not related to our integration-tests
        RuntimeTests runtimeTests = new RuntimeTests(registry);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();


        System.out.println("all services are started");

        //new BenchmarkTest(registry).doBenchmark();


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
