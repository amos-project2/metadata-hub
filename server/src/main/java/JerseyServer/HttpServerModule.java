package JerseyServer;

import JerseyServer.Impl.JerseyServerImpl;
import com.google.inject.AbstractModule;
import com.google.inject.Singleton;

public class HttpServerModule extends AbstractModule
{
    @Override
    protected void configure()
    {
        this.bind(HttpServer.class).to(JerseyServerImpl.class).in(Singleton.class);
    }

}
