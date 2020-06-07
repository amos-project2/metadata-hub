package Start;

import Benchmark.BenchmarkTest;
import Config.ApplicationConfig;

import Config.*;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.SQLException;


public class Start
{
    private static final Logger log = LoggerFactory.getLogger(Start.class);

    private final String[] args;
    public boolean isIntegrationTest = false;
    @Getter private Config config;
    private CLIParser cliParser;
    private DependenciesContainer dependenciesContainer;

    public static void main(String[] args) throws Exception
    {
        new Start(args).start();
    }

    public Start(String[] args)
    {
        this.args = args;
    }

    public void start() throws Exception
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        this.parseCLI();
        this.loadConfig();//could have System.exit-side-effect
        this.checkAndExcecuteIntegrationTest();
        this.loadDependencies();
        this.startApplication();
        this.executeRuntimeTests();
        this.executeBenchmark();

        System.out.println("all services are started");
        Thread.currentThread().join();
    }

    private void parseCLI()
    {
        cliParser = new CLIParser(args).parse();
    }

    private void loadConfig() throws IOException, JsonValideException
    {
        if ((this.config = ApplicationConfig.loadConfig(this.cliParser.getConfigFilePath())) == null)
        {
            System.exit(-1);
        }
    }

    private void checkAndExcecuteIntegrationTest()
    {
        boolean isIntegrationTest = this.cliParser.isIntegrationTest();

        if (this.isIntegrationTest)
        {
            System.out.println("***** INTEGRATION-TEST *****\n\n");

            IntegrationTest integrationTest = new IntegrationTest(dependenciesContainer);
            boolean result = integrationTest.testAll();

            if (result)
            {
                System.out.println("Integrationtest succeeded!");
                System.exit(0);
            }
            else
            {
                System.out.println("Integrationtest failed!");
                System.exit(-1);
            }
        }
    }

    private void loadDependencies()
    {
        this.dependenciesContainer = new DependenciesContainer(this.config);
    }

    private void startApplication()
    {
        ApplicationService applicationService = this.dependenciesContainer.getInjector().getInstance(ApplicationService.class);
        applicationService.startAll();
    }

    private  void executeRuntimeTests()
    {

        //this is not related to our integration-tests
        RuntimeTests runtimeTests = new RuntimeTests(this.dependenciesContainer);
        /**
         * you can add there tests, activate, deactivate, however you want
         */
        // runtimeTests.databaseTest();
        // runtimeTests.graphQLTest();

    }

    private  void executeBenchmark() throws SQLException, InterruptedException
    {
       // new BenchmarkTest(this.dependenciesContainer).doBenchmark();
    }










}
