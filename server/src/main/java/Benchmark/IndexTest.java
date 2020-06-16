package Benchmark;

import Database.Database;
import Start.DependenciesContainer;
import com.google.inject.Injector;
import org.jooq.meta.derby.sys.Sys;

import java.sql.*;

public class IndexTest {

    private final DependenciesContainer dependenciesContainer;
    private final Injector injector;
    private final Database db;
    private final Connection cn;



    private final int ITERATIONS = 100;


    public IndexTest(DependenciesContainer dependenciesContainer) throws SQLException {
        this.dependenciesContainer = dependenciesContainer;
        this.injector=dependenciesContainer.getInjector();
        this.db = dependenciesContainer.getInjector().getInstance(Database.class);
        this.cn = db.gC();

    }

    public void test() throws SQLException {
        System.out.println("**************\nStart index test! ");

        test_gin_index_metadata();



        System.out.println("End index test! \n**************");
    }

    public void test_gin_index_metadata() throws SQLException {

//        turnOffIndexScans();

        System.out.println("NORMAL SCANS ********************************************************");
        gin_index_query01(true);
        gin_index_query02();
        gin_index_query03();

//        turnOnIndexScans();

        System.out.println("INDEX SCANS ********************************************************");
        gin_index_query01(true);
        gin_index_query02();
        gin_index_query03();

    }

    private void gin_index_query01(boolean turnOffIndexing) throws SQLException {
        System.out.println("SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\"}';");
        System.out.println("-------------------------------------------------------------");
        long averageTime = 0;

        for(int i = 0; i < ITERATIONS; i++) {

            try (Connection connection = db.gC(); PreparedStatement statement = connection.prepareStatement("SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\"}';")) {

                if(turnOffIndexing){
                    turnOffIndexScans(connection);
                }

                long normalStartTime = System.nanoTime();

                statement.executeQuery();

                long normalEndTime = System.nanoTime();

                long diffTime = normalEndTime - normalStartTime;
                averageTime += diffTime;
                String executionResult = getResultAsString(diffTime);
                System.out.println(executionResult);
            }
        }

        averageTime = averageTime / ITERATIONS;
        System.out.println("Average Time: " + getResultAsString(averageTime));
        System.out.println("-------------------------------------------------------------");
    }

    private void gin_index_query02() {
        System.out.println("SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate'; ");
        System.out.println("-------------------------------------------------------------");
        long averageTime = 0;

        for(int i = 0; i < 20; i++) {
            long normalStartTime = System.nanoTime();

            try (Connection connection = db.gC(); Statement statement = cn.createStatement()) {
                statement.executeQuery("SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate'");
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }

            long normalEndTime = System.nanoTime();

            long diffTime = normalEndTime - normalStartTime;
            averageTime += diffTime;
            String executionResult = getResultAsString(diffTime);
            //System.out.println(executionResult);
        }
        averageTime = averageTime / ITERATIONS;
        System.out.println("Average Time: " + getResultAsString(averageTime));
        System.out.println("---------------------------------------------------------------");
    }

    private void gin_index_query03() {
        System.out.println("SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution'];");
        System.out.println("-------------------------------------------------------------");
        long averageTime = 0;

        int iterations = 20;
        for(int i = 0; i < iterations; i++) {
            long normalStartTime = System.nanoTime();

            try (Connection connection = db.gC(); Statement statement = cn.createStatement()) {
                statement.executeQuery("SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution']");
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }

            long normalEndTime = System.nanoTime();

            long diffTime = normalEndTime - normalStartTime;
            averageTime += diffTime;
            String executionResult = getResultAsString(diffTime);
            //System.out.println(executionResult);
        }

        averageTime = averageTime / ITERATIONS;
        System.out.println("Average Time: " + getResultAsString(averageTime));
        System.out.println("---------------------------------------------------------------");
    }

    private void turnOnIndexScans(Connection connection) throws SQLException {
        Statement enableBitMapScan = cn.createStatement();
        enableBitMapScan.executeUpdate("SET enable_bitmapscan TO true;");
        Statement enableIndexScan = cn.createStatement();
        enableIndexScan.executeUpdate("SET enable_indexscan TO true;");
    }

    private void turnOffIndexScans(Connection connection) throws SQLException {
        Statement disableBitMapScan = cn.createStatement();
        disableBitMapScan.executeUpdate("SET enable_bitmapscan TO false;");
        Statement disableIndexScan = cn.createStatement();
        disableIndexScan.executeUpdate("SET enable_indexscan TO false;");
    }

    public String getResultAsString(long diffTime) {
        String ret = " " + diffTime + " nano_sec | " + (diffTime / 1_000_000) + " m_sec";
        return ret;
    }
}
