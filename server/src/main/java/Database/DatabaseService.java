package Database;

public interface DatabaseService
{
    public void start() throws DatabaseException;
    public void shutdown();
}
