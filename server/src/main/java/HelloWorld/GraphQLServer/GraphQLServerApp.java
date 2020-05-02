package HelloWorld.GraphQLServer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GraphQLServerApp {

    // Visit at: http://localhost:8080/graphql
    public static void main(String[] args)
    {
        SpringApplication.run(GraphQLServerApp.class, args);
    }
}
