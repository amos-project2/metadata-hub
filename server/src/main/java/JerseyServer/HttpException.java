package JerseyServer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

//if we want to use it in libs, then it could be a good idea having here a unchecked Exception
public class HttpException extends RuntimeException
{
    @Getter
    private final int errorCode;
    @Getter
    private final String message;

    public HttpException(int errorCode, String message)
    {
        this.errorCode = errorCode;
        this.message = message;
    }

    public String getJsonString()
    {
        Map<String, Object> data = new HashMap<>();
        data.put("errorCode", errorCode);
        data.put("message", message);

        try
        {
            String json = new ObjectMapper().writeValueAsString(data);
            return json;
        }
        catch (JsonProcessingException e)
        {
            return "json-error";
        }


    }

}
