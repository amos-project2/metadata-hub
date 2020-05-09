package Start;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ApplicationConfig
{
    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfig.class);

    private boolean configExists = false;
    private boolean configValid = false;
    @Getter private String errorMessage = "Config File not exists/Config Path is incorrect";

    @Getter private final Properties config = new Properties();

    public ApplicationConfig(String filePath)
    {
        try
        {
            if (filePath == null)
            {
                //cause we read the file from our ressource, which is in the jar-file
                ClassLoader classloader = Thread.currentThread().getContextClassLoader();
                try (InputStream is = classloader.getResourceAsStream("config-local.properties"))
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

    public boolean isConfigValid()
    {
        return configValid;
    }

    //may not be overwritten, cause its called from the constructor -> final
    private final void validateConfig()
    {
        this.errorMessage = "";

        if (this.config.getProperty("dataSource.user") == null) this.errorMessage = "Property dataSource.user is missing";
        if (this.config.getProperty("dataSource.password") == null) this.errorMessage = "Property dataSource.password is missing";
        if (this.config.getProperty("dataSource.databaseName") == null) this.errorMessage = "Property dataSource.databaseName is missing";
        if (this.config.getProperty("dataSource.portNumber") == null) this.errorMessage = "Property dataSource.portNumber is missing";
        if (this.config.getProperty("dataSource.serverName") == null) this.errorMessage = "Property dataSource.serverName is missing";

        if (this.config.getProperty("httpserver.address") == null) this.errorMessage = "Property httpserver.address is missing";
        if (this.config.getProperty("httpserver.port") == null) this.errorMessage = "Property httpserver.port is missing";


        if (!this.errorMessage.equals(""))
        {
            return;
        }

        try
        {
            Integer.parseInt(this.config.getProperty("dataSource.portNumber"));
        }
        catch (NumberFormatException e)
        {
            this.errorMessage = "Property dataSource.portNumber must be an Integervalue";
        }

        try
        {
            Integer.parseInt(this.config.getProperty("httpserver.port"));
        }
        catch (NumberFormatException e)
        {
            this.errorMessage = "Property httpserver.port must be an Integervalue";
        }


        if (this.errorMessage.equals(""))
        {
            this.configValid = true;
        }
    }
}
