package Database.Impl;

import Config.Config;
import Database.Database;
import Database.DatabaseException;
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
import java.sql.SQLTransientConnectionException;
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
    @Getter private boolean isShutdowned = false;


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

    public synchronized void start() throws DatabaseException
    {
        this.isShutdowned = false;
        this.startIntern();
    }

    private synchronized void startIntern() throws DatabaseException
    {
        try
        {
            if (this.isShutdowned) throw new RuntimeException("the pool is shutdowned");
            if (this.isStarted) throw new RuntimeException("already started");

            //if it cant obtain a connection it throws an error
            hikariDataSource = new HikariDataSource(hikariConfig);
            dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);

            this.isStarted = true;

        }
        catch (Exception exception)
        {
            throw new DatabaseException("Couldn't establish connection to database!", exception);
        }
    }


    public synchronized void shutdown()
    {
        this.isShutdowned = true;
        if (!this.isStarted) return;

        this.dslContext.close();
        this.hikariDataSource.close();
        this.isStarted = false;
    }

    /**
     * If the db crashes after the pool is initialized, it works again after the db is restarted
     * In the meantime it throws an exception after a timeout. But retries later are possible
     */
    @Override
    public Connection getJDBCConnection() throws SQLException, DatabaseException
    {
        if (!this.isStarted)
        {
            start();
        }

        return this.hikariDataSource.getConnection();
    }


}
