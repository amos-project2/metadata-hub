package Database.Impl;

import Config.Config;
import Database.Database;
import Database.DatabaseService;
import com.google.inject.Inject;
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
public class DatabaseImpl implements Database, DatabaseService
{
    private final HikariConfig hikariConfig;
    @Getter private HikariDataSource hikariDataSource;
    @Getter private DSLContext dslContext;
    private static Config config;
    @Getter private boolean isStarted = false;


    @Inject
    public DatabaseImpl(Config config)
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

    @Override
    public Connection getJDBCConnection() throws SQLException
    {
        return this.hikariDataSource.getConnection();
    }


}