package Database;

import Config.Config;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;

public class DatabaseModule extends AbstractModule
{
//    @Provides @Singleton
//    static DatabaseProvider provideDatabaseController(Config config)
//    {
//        return new DatabaseProvider(config);
//    }

    @Override
    protected void configure()
    {
       // this.bind(DatabaseProvider.class).to(DatabaseProvider.class).in(Singleton.class);
    }
}
