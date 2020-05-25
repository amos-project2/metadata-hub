package Benchmark;

import java.util.ArrayList;

public class DirectJsonToEavComparer
{
    private final String meassureTitle;

    private long jsonStartTime = 0;
    private long jsonEndTime = 0;
    private long jsonDiffTime = 0;

    private long eavStartTime = 0;
    private long eavEndTime = 0;
    private long eavDiffTime = 0;

    public DirectJsonToEavComparer(String meassureTitle)
    {
        this.meassureTitle = meassureTitle;
    }

    public DirectJsonToEavComparer(ArrayList<DirectJsonToEavComparer> allComparer)
    {
        this.meassureTitle = "ALL TESTS";

        for (var value : allComparer)
        {
            this.jsonDiffTime += value.jsonDiffTime;
            this.eavDiffTime += value.eavDiffTime;
        }
    }

    private void checkState(long time)
    {
        if (time != 0) throw new IllegalStateException("this method was already executed");
    }

    public void startJsonTime()
    {
        this.checkState(jsonStartTime);
        this.jsonStartTime = System.currentTimeMillis();
    }

    public void endJsonTime()
    {
        this.checkState(jsonEndTime);
        this.jsonEndTime = System.currentTimeMillis();

        this.jsonDiffTime = this.jsonEndTime - this.jsonStartTime;
    }

    public void startEavTime()
    {
        this.checkState(eavStartTime);
        this.eavStartTime = System.currentTimeMillis();
    }

    public void endEavTime()
    {
        this.checkState(eavEndTime);
        this.eavEndTime = System.currentTimeMillis();

        this.eavDiffTime = this.eavEndTime - this.eavStartTime;
    }

    public boolean isJsonWin()
    {
        return this.jsonDiffTime <= this.eavDiffTime;
    }

    public String getResultAsString()
    {
        String ret = "*****\nTime-Measurement of: " + this.meassureTitle + "\n\n";
        ret += "Json: " + jsonDiffTime + "msec | " + (jsonDiffTime / 1000) + "sec\n";
        ret += "Eav: " + eavDiffTime + "msec | " + (eavDiffTime / 1000) + "sec\n\n";
        ret += "Diff: " + (eavDiffTime - jsonDiffTime) + "msec | " + ((eavDiffTime - jsonDiffTime) / 1000) + "sec ";
        ret += "(" + (isJsonWin() ? "Json-Win" : "Eav-Win") + ")\n*****\n";

        return ret;
    }

    public DirectJsonToEavComparer printResult()
    {
        System.out.println(this.getResultAsString());
        return this;
    }


    public void testJson(Runnable run)
    {
        this.startJsonTime();
        run.run();
        this.endJsonTime();
    }

    public void testEav(Runnable run)
    {
        this.startEavTime();
        run.run();
        this.endEavTime();
    }
}
