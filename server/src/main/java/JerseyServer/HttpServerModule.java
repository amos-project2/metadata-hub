package JerseyServer;

import com.google.inject.AbstractModule;

public class HttpServerModule extends AbstractModule
{
//    @Provides
//    @Singleton
//    static JerseyServer provideDatabaseController(GraphQL graphQL, Config config)
//    {
//        return new JerseyServer(graphQL, config);
//    }


    @Override
    protected void configure()
    {
       // this.bind(JerseyServer.class).to(JerseyServer.class).in(Singleton.class);
    }

}
