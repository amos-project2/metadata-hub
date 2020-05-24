package Database;

import Config.Config;
import Start.Start;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.Getter;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

import java.util.Properties;

public class DatabaseProvider
{
    @Getter private final HikariDataSource hikariDataSource;
    @Getter private final DSLContext dslContext;
    private static Config config;
    //TODO implement (maybe using jooq)


    public DatabaseProvider(Config config)
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

        HikariConfig hikariConfig = new HikariConfig(props);
        hikariDataSource = new HikariDataSource(hikariConfig);

        dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);
    }

    public void shutdown()
    {
        this.dslContext.close();
        this.hikariDataSource.close();
    }
}
