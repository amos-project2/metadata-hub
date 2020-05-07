package Database;

import Start.Start;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

import java.util.Properties;

public class DatabaseProvider
{
    private  HikariDataSource hikariDataSource;
    private  DSLContext dslContext;
    //TODO implement (maybe using jooq)


    public DatabaseProvider()
    {
        Properties props = new Properties();

        props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
        props.setProperty("minimumIdle", "2");


        props.setProperty("dataSource.user", Start.config.getProperty("dataSource.user"));
        props.setProperty("dataSource.password", Start.config.getProperty("dataSource.password"));
        props.setProperty("dataSource.databaseName", Start.config.getProperty("dataSource.databaseName"));
        props.setProperty("dataSource.portNumber", Start.config.getProperty("dataSource.portNumber"));
        props.setProperty("dataSource.serverName", Start.config.getProperty("dataSource.serverName"));

        HikariConfig config = new HikariConfig(props);
        hikariDataSource = new HikariDataSource(config);

        dslContext = DSL.using(hikariDataSource, SQLDialect.POSTGRES);
    }

    public HikariDataSource getHikariDataSource()
    {
        return hikariDataSource;
    }

    public DSLContext getDslContext()
    {
        return dslContext;
    }
}
