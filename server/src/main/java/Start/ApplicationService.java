package Start;

import Database.DatabaseException;
import Database.DatabaseService;
import JerseyServer.HttpServer;
import com.google.inject.Inject;
import com.google.inject.Singleton;

//TODO rename to ApplicationServer
@Singleton
public class ApplicationService
{
    @Inject DatabaseService database;
    @Inject HttpServer jerseyServer;


    public void startAll() throws DatabaseException {
        try{
            this.database.start();
        } catch (Exception exception){
            exception.printStackTrace();
        }
        this.jerseyServer.start();
    }

    public void shutdownAll()
    {
        this.jerseyServer.shutdown();
        this.database.shutdown();
    }

    public void shutdownNowAll()
    {
        this.jerseyServer.shutdownNow();
        this.database.shutdown();
    }

}
