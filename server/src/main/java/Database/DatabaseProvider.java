package Database;

import Config.Config;
import Start.Start;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.Getter;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

import java.util.Properties;


/**
 * Its a provider and a Service, cause we can start and stop the connection to the database here too
 */
@Singleton
public class DatabaseProvider
{
    @Getter private HikariDataSource hikariDataSource;
    @Getter private DSLContext dslContext;
    private static Config config;
    private final Properties props;
    @Getter private boolean isStarted=false;


    @Inject
    public DatabaseProvider(Config config)
    {
        this.config = config;
        props = new Properties();

        props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
        props.setProperty("minimumIdle", "2");

        props.setProperty("dataSource.user", config.getProperty("database-user"));
        props.setProperty("dataSource.password", config.getProperty("database-password"));
        props.setProperty("dataSource.databaseName", config.getProperty("database-name"));
        props.setProperty("dataSource.portNumber", config.getProperty("database-port"));
        props.setProperty("dataSource.serverName", config.getProperty("database-host"));

        System.out.println("created!!!!!!");

    }

    public void start()
    {
        if(this.isStarted) throw new RuntimeException("already started");
        this.isStarted=true;
        HikariConfig hikariConfig = new HikariConfig(props);
        hikariDataSource = new HikariDataSource(hikariConfig);
        dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);
    }

    public void shutdown()
    {
        if(!this.isStarted) return;

        this.dslContext.close();
        this.hikariDataSource.close();
        this.isStarted=false;
    }
}
