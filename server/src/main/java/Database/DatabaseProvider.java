package Database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

import java.util.Properties;

public class DatabaseProvider
{
    private final HikariDataSource hikariDataSource;
    private final DSLContext dslContext;
    //TODO implement (maybe using jooq)


    public DatabaseProvider()
    {
        Properties props = new Properties();

        props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
        props.setProperty("minimumIdle", "2");

        props.setProperty("dataSource.user", "metadatahub");
        props.setProperty("dataSource.password", "metadatahub");
        props.setProperty("dataSource.databaseName", "metadatahub");
        props.setProperty("dataSource.portNumber", "5432");
        props.setProperty("dataSource.serverName", "localhost");

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
