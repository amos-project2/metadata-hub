package Benchmark;

import Database.Database;
import Start.DependenciesContainer;
import com.google.inject.Injector;

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

        System.out.println("------ Gin Default ");
        System.out.println("--------------------- ");
        testQuery("SELECT * FROM files WHERE metadata ? 'FileInodeChangeDate';");
        testQuery("SELECT * FROM files WHERE metadata ?& array['FileInodeChangeDate', 'Filter', 'Compression', 'XResolution'];");

        System.out.println("------ Gin Jsonb Path Ops");
        System.out.println("------------------------- ");
        testQuery( "SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\"}';");

        System.out.println("------ Btree metadata ->>'FileName'");
        System.out.println("------------------------------------ ");
        testQuery("SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-53%';");
        testQuery("SELECT * FROM files WHERE metadata ->> 'FileName' LIKE 'CNV-5311%';");

        System.out.println("----- Btree files.name");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE name LIKE 'CNV-53%';");
        testQuery("SELECT * FROM files WHERE name LIKE 'CNV-5311%';");

        System.out.println("----- Btree files.size");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE size <= 300000;");
        testQuery("SELECT * FROM files WHERE size >= 300000;");
        testQuery("SELECT * FROM files WHERE size >= 500000;");
        testQuery("SELECT * FROM files WHERE size >= 800000;");

        System.out.println("----- Btree fullpath");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/%';");
        testQuery("SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/tmp/test_tree/dir2/dir4/dir7/dir8/dir10/%';");

    }

    private void testQuery(String sqlStatement) throws SQLException {
        System.out.println(sqlStatement);
        System.out.println("-------------------------------------------------------------");
        long averageTimeNormal = 0;
        long averageTimeIndex = 0;

        for(int i = 0; i < ITERATIONS; i++) {

            try (Connection connection = db.gC(); Statement statement = connection.createStatement()) {

                turnOffIndexScans(connection);

                long normalStartTime = System.nanoTime();

                statement.executeQuery(sqlStatement);

                long normalEndTime = System.nanoTime();

                long diffTime = normalEndTime - normalStartTime;
                averageTimeNormal += diffTime;
                String executionResult = getResultAsString(diffTime);
//                System.out.println(executionResult);
            }
        }

        for(int i = 0; i < ITERATIONS; i++) {

            try (Connection connection = db.gC(); Statement statement = connection.createStatement()) {

                turnOnIndexScans(connection);

                long normalStartTime = System.nanoTime();

                statement.executeQuery(sqlStatement);

                long normalEndTime = System.nanoTime();

                long diffTime = normalEndTime - normalStartTime;
                averageTimeIndex += diffTime;
                String executionResult = getResultAsString(diffTime);
//                System.out.println(executionResult);
            }
        }

        averageTimeNormal = averageTimeNormal / ITERATIONS;
        averageTimeIndex = averageTimeIndex / ITERATIONS;
        System.out.println("Average Time Normal : " + getResultAsString(averageTimeNormal));
        System.out.println("Average Time Index : " + getResultAsString(averageTimeIndex));
        System.out.println("Index Speed Up: " + getResultAsString(averageTimeNormal - averageTimeIndex));
        System.out.println("-------------------------------------------------------------");
    }


    private void turnOnIndexScans(Connection connection) throws SQLException {
        Statement enableBitMapScan = connection.createStatement();
        enableBitMapScan.executeUpdate("SET enable_bitmapscan TO true;");
        Statement enableIndexScan = connection.createStatement();
        enableIndexScan.executeUpdate("SET enable_indexscan TO true;");
    }

    private void turnOffIndexScans(Connection connection) throws SQLException {
        Statement disableBitMapScan = connection.createStatement();
        disableBitMapScan.executeUpdate("SET enable_bitmapscan TO false;");
        Statement disableIndexScan = connection.createStatement();
        disableIndexScan.executeUpdate("SET enable_indexscan TO false;");
    }

    public String getResultAsString(long diffTime) {
        String ret = " " + diffTime + " nano_sec | " + (diffTime / 1_000_000) + " m_sec";
        return ret;
    }
}
