package HelloWorld.SpringBoot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloWorldWebApp
{

    // Visit at http://localhost:8080/helloworld?name=Peter
    public static void main222(String[] args)
    {
        SpringApplication.run(HelloWorldWebApp.class, args);
    }
}
