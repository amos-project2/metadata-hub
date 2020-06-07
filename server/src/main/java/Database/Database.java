package Database;

import com.zaxxer.hikari.HikariDataSource;
import org.jooq.DSLContext;

import java.sql.Connection;
import java.sql.SQLException;

public interface Database
{
    /**
     * Here you can aquire directly a jdbc-connections from its pool
     */
    Connection getJDBCConnection() throws SQLException;


    /**
     * It's a synonym for getJDBCConnection()
     */
    default public Connection gC() throws SQLException
    {
        //i think its ok to use here a short-name, cause the database is omnipresent
        return this.getJDBCConnection();
    }

    /**
     * its the Hikari-Datasource,
     * Here you can aquire jdbc-connections from its pool
     */
    HikariDataSource getHikariDataSource();

    /**
     * its JooQ
     */
    DSLContext getDslContext();
}
