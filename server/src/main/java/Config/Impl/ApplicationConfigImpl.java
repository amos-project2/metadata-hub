package Config.Impl;

import Config.ApplicationConfig;
import Config.Config;
import Config.JsonValideException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class ApplicationConfigImpl implements ApplicationConfig
{
    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfigImpl.class);

    private boolean configExists = false;
    private boolean configValid = false;
    @Getter private String errorMessage = "Config File not exists/Config Path is incorrect";

    private final Config config;

    @Getter private final boolean isJson;// = false;
    @Getter private final String configFilePath;


    public ApplicationConfigImpl(String filePath, String filePathFromEnvironmentVariable) throws Exception
    {
        try
        {
            if (filePath == null && filePathFromEnvironmentVariable == null)
            {
                this.configFilePath = "intern-config-file";
                //cause we read the file from our ressource, which is in the jar-file
                ClassLoader classloader = Thread.currentThread().getContextClassLoader();
                try (InputStream is = classloader.getResourceAsStream("environment.default.copy.json");
                     InputStream is2 = classloader.getResourceAsStream("environment.default.copy.json");
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
                        try
                        {
                            properties.load(is2);
                        }
                        catch (Exception loadException)
                        {
                            throw new Exception("The local config is not found: please run one maven run, before you try to start in the IDEA", loadException);
                        }
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
        //TODO add validation-checks for the new config-attributes
        this.errorMessage = "";

        if (this.config.getProperty("database-user") == null) this.errorMessage = "Property database-user is missing";
        if (this.config.getProperty("database-password") == null) this.errorMessage = "Property database-password is missing";
        if (this.config.getProperty("database-name") == null) this.errorMessage = "Property database-name is missing";
        if (this.config.getProperty("database-port") == null) this.errorMessage = "Property database-port is missing";
        if (this.config.getProperty("database-host") == null) this.errorMessage = "Property database-host is missing";

        if (this.config.getProperty("server-host") == null) this.errorMessage = "Property server-host is missing";
        if (this.config.getProperty("server-port") == null) this.errorMessage = "Property server-port is missing";



        {
            String tmp = this.config.getProperty("server-logging-level");
            if (tmp == null) tmp = "";
            tmp = tmp.toLowerCase().trim();

            if (!(tmp.equals("trace") || tmp.equals("debug") || tmp.equals("error") || tmp.equals("warn") || tmp.equals("info"))) this.errorMessage = "Property server-logging-level must contain warn, error, trace, debug or info";
        }

        if (this.config.getProperty("server-logging-level") == null) this.errorMessage = "Property server-logging-level is missing";

        if (this.config.getProperty("webui-queryConstructorEnabled") == null) this.errorMessage = "Property webui-queryConstructorEnabled is missing";
        if (this.checkBooleanValue(this.config.getProperty("webui-queryConstructorEnabled"))) this.errorMessage = "Property webui-queryConstructorEnabled must be a boolean";

        if (this.config.getProperty("webui-crawlerEnabled") == null) this.errorMessage = "Property webui-crawlerEnabled is missing";
        if (this.checkBooleanValue(this.config.getProperty("webui-crawlerEnabled"))) this.errorMessage = "Property webui-crawlerEnabled must be a boolean";

        if (this.config.getProperty("webui-defaultUsername") == null) this.errorMessage = "Property webui-defaultUsername is missing";

        if (this.config.getProperty("webui-adminLoginEnabeled") == null) this.errorMessage = "Property webui-adminLoginEnabeled is missing";
        if (this.checkBooleanValue(this.config.getProperty("webui-adminLoginEnabeled"))) this.errorMessage = "Property webui-adminLoginEnabeled must be a boolean";

        if (this.config.getProperty("webui-enduserLoginEnabled") == null) this.errorMessage = "Property webui-enduserLoginEnabled is missing";
        if (this.checkBooleanValue(this.config.getProperty("webui-enduserLoginEnabled"))) this.errorMessage = "Property webui-enduserLoginEnabled must be a boolean";

        if (this.config.getProperty("webui-autoLogin") == null) this.errorMessage = "Property webui-autoLogin is missing";

        if (this.config.getProperty("webui-pageChangeAnimation") == null) this.errorMessage = "Property webui-pageChangeAnimation is missing";
        if (this.checkBooleanValue(this.config.getProperty("webui-pageChangeAnimation"))) this.errorMessage = "Property webui-pageChangeAnimation must be a boolean";


        if (!this.getErrorMessage().equals(""))
        {
            return;
        }

        try
        {
            Integer.parseInt(this.config.getProperty("database-port"));
        }
        catch (NumberFormatException e)
        {
            this.errorMessage = "Property database-port must be an Integervalue";
        }

        try
        {
            Integer.parseInt(this.config.getProperty("server-port"));
        }
        catch (NumberFormatException e)
        {
            this.errorMessage = "Property server-port must be an Integervalue";
        }


        if (this.getErrorMessage().equals(""))
        {
            this.configValid = true;
        }
    }

    //invert-logic in result
    private boolean checkBooleanValue(String value)
    {
        String tmp = value;
        if (tmp == null) tmp = "";
        tmp = tmp.toLowerCase().trim();

        if(tmp.equals("true")) return false;
        if(tmp.equals("false")) return false;

        return true;
    }

    public Config getConfig()
    {
        if (!this.isConfigValid()) throw new RuntimeException("Config is not valid");
        return this.config;
    }
}
