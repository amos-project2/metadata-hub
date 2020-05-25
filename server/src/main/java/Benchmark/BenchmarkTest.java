package Benchmark;

import Start.Registry;
import lombok.SneakyThrows;

import java.util.ArrayList;

public class BenchmarkTest
{
    private final Registry registry;

    public BenchmarkTest(Registry registry)
    {

        this.registry = registry;
    }

    private DirectJsonToEavComparer createAndGetComparer(String meassureTitle)
    {
        return new DirectJsonToEavComparer(meassureTitle);
    }

    public void doBenchmark() throws InterruptedException
    {
        System.out.println("START BENCHMARK TESTS:\n\n");
        var allComparer = new ArrayList<DirectJsonToEavComparer>();


        //here we can add the delegation to the test-methods

        allComparer.add(this.test1().printResult());
        allComparer.add(this.test2().printResult());


        //finish


        long jsonWins = 0;
        long eavWins = 0;
        for (var value : allComparer)
        {
            if (value.isJsonWin())
            {
                jsonWins++;
            }
            else
            {
                eavWins++;
            }
        }

        new DirectJsonToEavComparer(allComparer).printResult();

        System.out.println("Json-Wins: " + jsonWins + " | Eav-Wins: " + eavWins);
        System.out.println("END BENCHMARK TESTS\n\n");
    }

    /**
     * Example without lambda-syntax
     */
    private DirectJsonToEavComparer test1() throws InterruptedException
    {

        var c = this.createAndGetComparer("Test 1");
        c.startJsonTime();
        {
            Thread.sleep(300);
        }
        c.endJsonTime();

        c.startEavTime();
        {
            Thread.sleep(700);
        }
        c.endEavTime();

        return c;
    }

    /**
     * Example with lambda-syntax
     */
    private DirectJsonToEavComparer test2() throws InterruptedException
    {
        return this.createAndGetComparer("Test 2").testJson(() ->
        {
            Thread.sleep(600);
        }).testEav(() ->
        {
            Thread.sleep(1200);
        });

    }


}
