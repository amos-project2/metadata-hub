package Config;

import Config.Impl.ApplicationConfigImpl;
import Config.Impl.JsonValideException;

import java.io.IOException;
import java.util.Map;

public interface ApplicationConfig
{
	static Config loadConfig(String configFilePath) throws IOException, JsonValideException
	{
		try
		{
			Map<String, String> env = System.getenv();
			ApplicationConfig applicationConfig = new ApplicationConfigImpl(configFilePath, env.get("METADATAHUB_ENV"));

			if (!applicationConfig.isConfigValid())
			{
				System.out.println("Config (" + applicationConfig.getConfigFilePath() + ") is not valide: " + applicationConfig.getErrorMessage());
				return null;
			}
			System.out.println("Used config-file: " + applicationConfig.getConfigFilePath() + " [" + ((applicationConfig.isJson()) ? "JSON" : "PROPERTY-FILE") + "]");
			return applicationConfig.getConfig();
		}
		catch (Exception e)
		{
			e.printStackTrace();
			System.out.println("Error in loading the config: " + e.getMessage());
			return null;
		}

	}

	boolean configExists();

	boolean isConfigValid();

	Config getConfig();

    /**
     * in a error-case, here you get a detailed error-message
     */
	String getErrorMessage();

	boolean isJson();

	String getConfigFilePath();
}
