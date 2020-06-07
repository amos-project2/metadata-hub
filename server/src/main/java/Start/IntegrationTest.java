package Start;

import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.LauncherDiscoveryRequest;
import org.junit.platform.launcher.TestPlan;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.junit.platform.launcher.listeners.TestExecutionSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.event.TextListener;
import java.io.PrintWriter;

import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;

public class IntegrationTest
{
    private static final Logger log = LoggerFactory.getLogger(IntegrationTest.class);
    private final DependenciesContainer dependenciesContainer;

    public IntegrationTest(DependenciesContainer dependenciesContainer)
    {
        this.dependenciesContainer = dependenciesContainer;
    }

    //here you can start the integration-tests
    public boolean testAll()
    {
        try
        {

            //TODO thats junit 5, maybe we have to use junit 4
            //TODO https://www.baeldung.com/junit-tests-run-programmatically-from-java
            //TODO maybe we have to move the junit-integration-test-files away from the test/ folder

//            SummaryGeneratingListener listener = new SummaryGeneratingListener();
//
//
//            LauncherDiscoveryRequest request = LauncherDiscoveryRequestBuilder.request()
//                .selectors(selectClass(AllTests.class))
//                .build();
//            Launcher launcher = LauncherFactory.create();
//            TestPlan testPlan = launcher.discover(request);
//            launcher.registerTestExecutionListeners(listener);
//            launcher.execute(request);
//
//            TestExecutionSummary summary = listener.getSummary();
//            summary.printTo(new PrintWriter(System.out));


            return true;
        }
        catch (Throwable e)
        {
            log.info(e.getMessage());
            return false;
        }
    }
}
