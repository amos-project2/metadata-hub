import GraphQLQueryTests.getDirMetadataTest;
import GraphQLQueryTests.getFileMetadataTest;
import TestSetup.TestSetup;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)

@Suite.SuiteClasses({
    getFileMetadataTest.class,
    getDirMetadataTest.class
})

// Server has to be running as well right now
//PostgreSQL Database needs to be running and metadatahub-data.sql has to be inserted
public class AllGraphQLQueryTests {

    @BeforeClass
    public static void setup(){
        System.out.println("Setup start");

/*
        ExecutorService executorService = Executors.newSingleThreadExecutor();

        Runnable serverTask = new Runnable(){
            @Override
            public void run(){
                if(TestSetup.testServer == null){
                    TestSetup.setupServer();
                }
            }
        };

        Thread serverThread = new Thread(serverTask);
        serverThread.start();

        //TODO Server starts after Client request?
        try {
            Thread.sleep(9);
        } catch (InterruptedException e) {
            e.printStackTrace();
        TestSetup}
*/

        if(TestSetup.testClient == null){
            TestSetup.setupClient();
        }
        System.out.println("Setup done");
    }

    @AfterClass
    public static void tearDown(){
        if(TestSetup.testServer != null){
            TestSetup.shutdownServer();
        }
        if(TestSetup.testClient != null){
            TestSetup.shutdownClient();
        }
    }
}
