package Config;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;

public class ConfigModule extends AbstractModule
{
    private final Config config;
    public ConfigModule(Config config)
    {
        this.config = config;
    }

    @Provides @Singleton
    Config provideDatabaseController()
    {
        return this.config;
    }
}
