package Utilities;

import com.google.inject.Singleton;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

@Singleton
public class ClassPathFileLoader
{
    public String loadFile(String fileName) throws IOException
    {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        StringBuilder out = new StringBuilder();
        try (InputStream is = classloader.getResourceAsStream(fileName);
             InputStreamReader isr = new InputStreamReader(is);// im not sure if we can use this directly in the constructor of Buffered Reader, with try-with TODO research
             BufferedReader reader = new BufferedReader(isr);)
        {
            String line;
            while ((line = reader.readLine()) != null)
            {
                out.append(line);
            }
        }


        return out.toString();
    }
}
