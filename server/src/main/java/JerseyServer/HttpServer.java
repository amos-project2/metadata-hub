package JerseyServer;

public interface HttpServer
{
	void start();

	void shutdown();

	void shutdownNow();
}
