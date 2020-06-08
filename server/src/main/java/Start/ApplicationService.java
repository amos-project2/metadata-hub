package Start;

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


    public void startAll()
    {
        this.database.start();
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
