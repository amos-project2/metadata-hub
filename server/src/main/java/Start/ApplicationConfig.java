package Start;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Properties;

public class ApplicationConfig
{
    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfig.class);

    private boolean configExists = false;
    private boolean configValide = false;
    private String errorMessage = "Config File not exists/Config Path is incorrect";

    private final Properties config = new Properties();

    public ApplicationConfig(String filePath)
    {
        try
        {
            if (filePath == null)
            {
                //cause we read the file from our ressource, which is in the jar-file
                ClassLoader classloader = Thread.currentThread().getContextClassLoader();
                try (InputStream is = classloader.getResourceAsStream("config-local.properties");)
                {
                    config.load(is);
                    this.configExists = true;
                    this.validateConfig();
                }
            }
            else
            {
                // File jarFile = new File(Start.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());

                //  String configFilePath = jarFile.getParent() + File.separator + "config.properties";

                try (InputStream input = new FileInputStream(filePath))
                {
                    config.load(input);
                    configExists = true;
                    this.validateConfig();
                }
            }
        }
        catch (IOException e)
        {
            logger.info(e.getMessage());
        }

    }

    public boolean configExists()
    {
        return configExists;
    }

    public boolean isConfigValide()
    {
        return configValide;
    }

    public Properties getConfig()
    {
        return config;
    }

    //may not be overwritten, cause its called from the constructor -> final
    private final void validateConfig()
    {
        this.errorMessage = "";

        if (this.config.get("foo") == null) this.errorMessage = "Property foo is missing";


        if (this.errorMessage.equals(""))
        {
            this.configValide = true;
        }
    }

    public String getErrorMessage()
    {
        return this.errorMessage;
    }
}
