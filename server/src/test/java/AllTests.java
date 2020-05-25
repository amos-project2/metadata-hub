import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)

@Suite.SuiteClasses({
    AllGraphQLQueryTests.class
})

//PostgresSQL database needs to be running with metadatahub-data.sql inserted
public class AllTests {
}
