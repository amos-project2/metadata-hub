package Database;

import Config.Config;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.Getter;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;


/**
 * Its a provider and a Service, cause we can start and stop the connection to the database here too
 * So the name Database here is the best option
 */
@Singleton
public class Database
{
    private final HikariConfig hikariConfig;
    private HikariDataSource hikariDataSource;
    @Getter private DSLContext dslContext;
    private static Config config;
    @Getter private boolean isStarted = false;


    @Inject
    public Database(Config config)
    {
        this.config = config;
        Properties props = new Properties();

        props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
        props.setProperty("minimumIdle", "2");

        props.setProperty("dataSource.user", config.getProperty("database-user"));
        props.setProperty("dataSource.password", config.getProperty("database-password"));
        props.setProperty("dataSource.databaseName", config.getProperty("database-name"));
        props.setProperty("dataSource.portNumber", config.getProperty("database-port"));
        props.setProperty("dataSource.serverName", config.getProperty("database-host"));
        hikariConfig = new HikariConfig(props);

    }

    public void start()
    {
        if (this.isStarted) throw new RuntimeException("already started");
        this.isStarted = true;

        hikariDataSource = new HikariDataSource(hikariConfig);
        dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);
    }

    public void shutdown()
    {
        if (!this.isStarted) return;

        this.dslContext.close();
        this.hikariDataSource.close();
        this.isStarted = false;
    }

    public Connection getJDBCConnection() throws SQLException
    {
        return this.hikariDataSource.getConnection();
    }

    //i think its ok to use here a short-name, cause the database is omnipresent
    /**
     *It's a synonym for getJDBCConnection()
     */
    public Connection gC() throws SQLException
    {
        return this.getJDBCConnection();
    }


}
