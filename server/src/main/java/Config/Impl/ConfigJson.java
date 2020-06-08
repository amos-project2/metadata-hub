package Config.Impl;

import Config.Config;
import lombok.Getter;

import java.util.Map;

public class ConfigJson implements Config
{
    private final Map<Object, Object> data;

    public ConfigJson(Map<Object, Object> data)
    {
        this.data = data;
    }

    /**
     * Only String, Integer and Boolean are allowed Json-value-types
     */
    @Override
    public String getProperty(String key)
    {
        Object tmp = data.get(key);
        if (tmp == null) return null;
        if (tmp instanceof String) return (String) tmp;
        if (tmp instanceof Integer) return Integer.toString((Integer) tmp);
        if (tmp instanceof Boolean) return ((Boolean) tmp) ? "true" : "false";

        throw new RuntimeException("Json-key " + key + " holds data from a not supported datatype");

    }

    public IsJsonValide isJsonValide()
    {
        IsJsonValide isJsonValide = new IsJsonValide(true, "");
        this.data.forEach((key, value) ->
        {
            if (!(key instanceof String))
            {
                isJsonValide.set(false, "key " + key + "isnt from type String");
                return;
            }

            if (!(value instanceof String || value instanceof Integer || value instanceof Boolean))
            {
                isJsonValide.set(false, "the value from key " + key + " isn't from type String or Integer or Boolean");
                return;
            }

        });

        return isJsonValide;

    }

    public ConfigJson isJsonValideIfNotException() throws JsonValideException
    {
        IsJsonValide jsonValide = this.isJsonValide();
        if (jsonValide.isState()) return this;

        throw new JsonValideException(jsonValide.getErrorMessage());
    }

    public static class IsJsonValide
    {
        @Getter boolean state;
        @Getter String errorMessage;

        private IsJsonValide(boolean state, String errorMessage)
        {
            this.state = state;
            this.errorMessage = errorMessage;
        }

        private void set(boolean state, String errorMessage)
        {
            this.state = state;
            this.errorMessage = errorMessage;
        }
    }
}
