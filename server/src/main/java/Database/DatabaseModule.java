package Database;

import Config.Config;
import Database.Impl.DatabaseImpl;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;

public class DatabaseModule extends AbstractModule
{
    @Override
    protected void configure()
    {
        this.bind(DatabaseImpl.class).in(Singleton.class);
        this.bind(Database.class).to(DatabaseImpl.class);
        this.bind(DatabaseService.class).to(DatabaseImpl.class);
    }
}
