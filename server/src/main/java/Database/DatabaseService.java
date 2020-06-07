package Database;

import com.zaxxer.hikari.HikariDataSource;
import org.jooq.DSLContext;

import java.sql.Connection;
import java.sql.SQLException;

public interface DatabaseService
{
    public void start();
    public void shutdown();
}
