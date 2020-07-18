package Benchmark;

import Database.*;
import Start.DependenciesContainer;
import com.google.inject.Injector;

import java.sql.*;

public class IndexTest {

    private final DependenciesContainer dependenciesContainer;
    private final Injector injector;
    private final Database db;
    private final Connection cn;



    private final int ITERATIONS = 50;


    public IndexTest(DependenciesContainer dependenciesContainer) throws SQLException, DatabaseException {
        this.dependenciesContainer = dependenciesContainer;
        this.injector=dependenciesContainer.getInjector();
        this.db = dependenciesContainer.getInjector().getInstance(Database.class);
        this.cn = db.gC();

    }

    public void test() throws SQLException, DatabaseException {
        System.out.println("**************\nStart index test! ");

        test_gin_index_metadata();



        System.out.println("End index test! \n**************");
    }

    public void test_gin_index_metadata() throws SQLException, DatabaseException {

        System.out.println("Query Iterations: " + ITERATIONS);
        System.out.println("------ Gin Default ");
        System.out.println("--------------------- ");
        testQuery("SELECT * FROM files WHERE metadata ? 'Format';");
        testQuery("SELECT * FROM files WHERE metadata ?& array['Format', 'Balance', 'HistoryWhen', 'MajorBrand'];");

        System.out.println("------ Gin Jsonb Path Ops");
        System.out.println("------------------------- ");
        testQuery( "SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\"}';");
        testQuery( "SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\", \"BitsPerSample\": 8, \"FilePermissions\": 770, \"YCbCrSubSampling\": \"2 2\"}';");
        testQuery( "SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\", \"BitsPerSample\": 8, \"FilePermissions\": 770, \"YCbCrSubSampling\": \"2 2\"," +
            " \"ImageSize\": \"78 78\", \"YResolution\": 1, \"ColorComponents\": 3, \"EncodingProcess\": 0, \"Megapixels\": 0.006084}';");
        testQuery( "SELECT * FROM files WHERE metadata @> '{\"MIMEType\":\"image/jpeg\"}' AND metadata @> '{\"BitsPerSample\": 8}' AND metadata @> '{\"FilePermissions\": 770}'" +
            "AND metadata @> '{\"YCbCrSubSampling\": \"2 2\"}' AND metadata @> '{\"ImageSize\": \"78 78\"}' AND metadata @> '{\"YResolution\": 1}'" +
            "AND metadata @> '{\"ColorComponents\": 3}' AND metadata @> '{\"EncodingProcess\": 0}' AND metadata @> '{\"Megapixels\": 0.006084}';");

        System.out.println("------ Btree metadata ->>'FileName'");
        System.out.println("------------------------------------ ");
        testQuery("SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-01-01-01-11.mp4%';");
        testQuery("SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-02-01-%';");
        testQuery("SELECT * FROM files WHERE metadata ->> 'FileName' LIKE '01-%';");

        System.out.println("----- Btree files.name");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE name LIKE '01-02-01-01-01-01-11.mp4%';");
        testQuery("SELECT * FROM files WHERE name LIKE '01-02-01-%';");
        testQuery("SELECT * FROM files WHERE name LIKE '01-%';");
//
        System.out.println("----- Btree files.size");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE size <= 300000 AND size >= 250000;");
        testQuery("SELECT * FROM files WHERE size >= 300000 AND size <= 350000;");
        testQuery("SELECT * FROM files WHERE size >= 800000 AND size <= 900000;");
        testQuery("SELECT * FROM files WHERE size >= 800000;");
//
        System.out.println("----- Btree fullpath");
        System.out.println("----------------------- ");
        testQuery("SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/0%';");
        testQuery("SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-%';");
        testQuery("SELECT * FROM files WHERE (dir_path||'/'||files.name) LIKE '/media/benjamin/WD2TB/Dataset/Video_Song_Actor_11/Actor_11/01-02-04-02-02-02-11.mp4%';");

    }

    private void testQuery(String sqlStatement) throws SQLException, DatabaseException {
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
        System.out.println("Average Time Sequential : " + getResultAsString(averageTimeNormal));
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
