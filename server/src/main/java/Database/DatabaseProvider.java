package Database;

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
    private static final Properties config = Start.getConfig();
    //TODO implement (maybe using jooq)


    public DatabaseProvider()
    {
        Properties props = new Properties();

        props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
        props.setProperty("minimumIdle", "2");

        props.setProperty("dataSource.user", config.getProperty("dataSource.user"));
        props.setProperty("dataSource.password", config.getProperty("dataSource.password"));
        props.setProperty("dataSource.databaseName", config.getProperty("dataSource.databaseName"));
        props.setProperty("dataSource.portNumber", config.getProperty("dataSource.portNumber"));
        props.setProperty("dataSource.serverName", config.getProperty("dataSource.serverName"));

        HikariConfig config = new HikariConfig(props);
        hikariDataSource = new HikariDataSource(config);

        dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);
    }
}
