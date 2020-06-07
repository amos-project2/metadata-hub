package Start;

import Database.DatabaseProvider;
import JerseyServer.JerseyServer;
import com.google.inject.Inject;
import com.google.inject.Singleton;

//TODO rename to ApplicationServer
@Singleton
public class ApplicationService
{
    @Inject DatabaseProvider databaseProvider;
    @Inject JerseyServer jerseyServer;


    public void startAll()
    {
        this.databaseProvider.start();
        this.jerseyServer.start();
    }

    public void shutdownAll()
    {
        this.jerseyServer.shutdown();
        this.databaseProvider.shutdown();
    }

    public void shutdownNowAll()
    {
        this.jerseyServer.shutdownNow();
        this.databaseProvider.shutdown();
    }

}
