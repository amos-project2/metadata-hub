package Start;

import Benchmark.BenchmarkTest;
import Benchmark.IndexTest;
import Config.ApplicationConfig;
import Config.Config;
import Config.JsonValideException;
import Database.DatabaseException;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;


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
        try
        {
            new Start(args).start();
        }
        catch (Exception exception)
        {
            exception.printStackTrace();
        }
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
        this.setLoggerLevel();
        this.loadDependencies();
        this.startApplication();
        this.executeBenchmark();
        this.executeIndex();

        System.out.println("all services are started");
        Thread.currentThread().join();
    }

    private void setLoggerLevel()
    {

        String logLevel = this.config.getProperty("server-logging-level", "info");  // default to Level.DEBUG

        Level level = Level.toLevel(logLevel.toUpperCase());

        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        List<ch.qos.logback.classic.Logger> loggerList = loggerContext.getLoggerList();
        loggerList.stream().forEach(tmpLogger -> tmpLogger.setLevel(level));
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

    private void loadDependencies()
    {
        this.dependenciesContainer = new DependenciesContainer(this.config);
    }

    private void startApplication() throws SQLException, DatabaseException
    {
        ApplicationService applicationService = this.dependenciesContainer.getInjector().getInstance(ApplicationService.class);
        applicationService.startAll();
    }

    private void executeBenchmark() throws SQLException, InterruptedException, DatabaseException
    {
        boolean enableBenchmark = false;
        if (enableBenchmark)
        {
            new BenchmarkTest(this.dependenciesContainer).doBenchmark();
        }
    }

    private void executeIndex() throws SQLException, InterruptedException, DatabaseException
    {
        boolean enableIndexTest = false;
        if (enableIndexTest)
        {
            new IndexTest(this.dependenciesContainer).test();
        }
    }


}
