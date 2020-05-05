package HelloWorld.GraphQLServer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Start
{
    private static final Logger logger = LoggerFactory.getLogger(Start.class);

    public static void main(String[] args)
    {
        System.out.println("AMOS-GRAPHQL-SERVER");

        SpringApplication.run(Start.class, args);

        System.out.println("is running on" + "http://localhost:8080");
    }
}
