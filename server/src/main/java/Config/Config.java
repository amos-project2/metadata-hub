package Config;

public interface Config
{
    public String getProperty(String key);

    default public String getProperty(String key, String defaultValue)
    {
        String tmp = this.getProperty(key);
        return (tmp == null) ? defaultValue : tmp;
    }

}
