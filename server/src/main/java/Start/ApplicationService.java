package Start;

import Database.DatabaseProvider;
import JerseyServer.JerseyServer;
import com.google.inject.Inject;

public class ApplicationService
{
    @Inject DatabaseProvider databaseProvider;
    @Inject JerseyServer jerseyServer;



    public void startAll()
    {
//        databaseProvider start
//        server start
    }

    public void shutdownAll()
    {

    }

    public void shutdownNowAll()
    {

    }

}
