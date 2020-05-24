package Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class ApplicationConfig
{
    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfig.class);

    private boolean configExists = false;
    private boolean configValid = false;
    @Getter private String errorMessage = "Config File not exists/Config Path is incorrect";

    private final Config config;

    @Getter private final boolean isJson;// = false;
    @Getter private final String configFilePath;

    public ApplicationConfig(String filePath, String filePathFromEnvironmentVariable) throws Exception
    {
        try
        {
            if (filePath == null && filePathFromEnvironmentVariable == null)
            {
                this.configFilePath = "intern-config-file";
                //cause we read the file from our ressource, which is in the jar-file
                ClassLoader classloader = Thread.currentThread().getContextClassLoader();
                try (InputStream is = classloader.getResourceAsStream("config-local.properties");
                     InputStream is2 = classloader.getResourceAsStream("config-local.properties");
                )
                {

                    Config tmp;
                    try
                    {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<Object, Object> map = mapper.readValue(is, Map.class);
                        tmp = new ConfigJson(map).isJsonValideIfNotException();

                    }
                    catch (IOException e)
                    {
                        logger.info("no json-format detected, fallback to property-format");
                        //ok its no json-format, so try next the properties-format
                        ConfigProperty properties = new ConfigProperty();
                        properties.load(is2);
                        tmp = properties;
                    }
                    this.config = tmp;
                    this.configExists = true;
                    this.validateConfig();
                }
            }
            else
            {

                if (filePath == null)
                {
                    //if filePath==null fall back to the environmentPath
                    filePath = filePathFromEnvironmentVariable;
                }
                this.configFilePath = filePath;

                try (InputStream input = new FileInputStream(filePath);
                     InputStream input2 = new FileInputStream(filePath);
                )
                {
                    Config tmp;
                    try
                    {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<Object, Object> map = mapper.readValue(input, Map.class);
                        tmp = new ConfigJson(map).isJsonValideIfNotException();

                    }
                    catch (IOException e)
                    {
                        logger.info("no json-format detected, fallback to property-format");
                        //ok its no json-format, so try next the properties-format
                        ConfigProperty properties = new ConfigProperty();
                        properties.load(input2);
                        tmp = properties;
                    }

                    this.config = tmp;
                    configExists = true;
                    this.validateConfig();
                }
            }

            this.isJson = (this.config instanceof ConfigJson) ? true : false;

        }
        catch (IOException | JsonValideException e)
        {
            logger.info(e.getMessage());
            throw new Exception("Config-File: " + this.getConfigFilePath() + " | " + e.getMessage(), e);
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


        if (!this.getErrorMessage().equals(""))
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


        if (this.getErrorMessage().equals(""))
        {
            this.configValid = true;
        }
    }

    public Config getConfig()
    {
        if(!this.isConfigValid()) throw new RuntimeException("Config is not valid");
        return this.config;
    }
}