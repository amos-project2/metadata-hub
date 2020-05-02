
import HelloWorld.GraphQLServer.GraphQLServerApp;
import HelloWorld.SpringBoot.HelloWorldWebApp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Start
{
    //if we dont want to use that, i can remove it again.
    private static final Logger logger = LoggerFactory.getLogger(Start.class);


    public static void main(String[] args)
    {
        //here you find more to the logger-architecture: http://logback.qos.ch/manual/architecture.html
        logger.error("running-error");//this is displayed, cause root level="error" in logback-test.xml
        logger.info("running");//this not cause info > error
        //the documentation you can find there: http://logback.qos.ch/manual/index.html
        //in logback-text.xml we can configure, which kind of messages are printed and/or are pasted into a debug-file

        System.out.println("it runs");


        GraphQLServerApp.main222(args);

        //here you can create an instance to your hello-world component and run it

    }
}
