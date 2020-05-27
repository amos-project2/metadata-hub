package Benchmark;

import Model.File;
import Model.Metadatum;
import Start.Registry;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import lombok.SneakyThrows;
import org.jooq.tools.json.JSONArray;
import org.jooq.tools.json.JSONObject;
import org.jooq.tools.json.JSONParser;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;

public class BenchmarkTest
{
    private final Registry registry;
    private final Client client;

    public BenchmarkTest(Registry registry)
    {

        this.registry = registry;
        client = ClientBuilder.newClient();

    }

    private DirectJsonToEavComparer createAndGetComparer(String meassureTitle)
    {
        return new DirectJsonToEavComparer(meassureTitle);
    }

    public void doBenchmark() throws InterruptedException, SQLException {
        System.out.println("START BENCHMARK TESTS:\n\n");
        var allComparer = new ArrayList<DirectJsonToEavComparer>();


        //here we can add the delegation to the test-methods

        allComparer.add(this.test1().printResult());
        allComparer.add(this.test2().printResult());
        allComparer.add(this.test3().printResult());


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
    private DirectJsonToEavComparer test1() throws InterruptedException, SQLException {

        var c = this.createAndGetComparer("Test 1");

        //Use of Khangs Data dump -> has to be loaded into the database
        HikariDataSource dataSource = registry.getDatabaseProvider().getHikariDataSource();
        String dir_path = "G:/";


        System.out.println("Start Test(1): Fetching First 100.000 ROWS");
        c.startJsonTime();
        {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT * FROM public.file_generic " +
                         "WHERE public.file_generic.sub_dir_path LIKE ?" +
                         "FETCH FIRST 100000 ROWS ONLY")) {
                selectStmt.setString(1, dir_path + "%");
                ResultSet rsJson = selectStmt.executeQuery();
            }
        }
        c.endJsonTime();
        System.out.println("Benchmark: Test(1): Json = Done");

        c.startEavTime();
        {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT *, public.file_generic.id AS file_id " +
                         "FROM public.file_generic " +
                         "INNER JOIN public.file_generic_data_eav ON public.file_generic.\"id\" = public.file_generic_data_eav.\"file_generic_id\" " +
                         "WHERE public.file_generic.sub_dir_path LIKE ?" +
                         "AND NOT public.file_generic.id = 0 " +
                         "FETCH FIRST 100000 ROWS ONLY")) {
                selectStmt.setString(1, dir_path + "%");
                ResultSet rsEAV = selectStmt.executeQuery();
            }
        }
        c.endEavTime();
        System.out.println("Benchmark: Test(1): EAV = Done");

        return c;
    }

    /**
     * Example with lambda-syntax
     */
    private DirectJsonToEavComparer test2() throws InterruptedException, SQLException {
        //Use of Khangs Data dump -> has to be loaded into the database
        HikariDataSource dataSource = registry.getDatabaseProvider().getHikariDataSource();
        String dir_path = "G:/";

        System.out.println("Start Test(2): Get all Files with FileSize 40 kB");
        return this.createAndGetComparer("Test 2").testJson(() ->
        {

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT * FROM public.file_generic " +
                         "WHERE public.file_generic.metadata ->> 'FileSize' = '40 kB' ")) {
                ResultSet rsJson = selectStmt.executeQuery();
            }
        }).testEav(() ->
        {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT * " +
                         "FROM public.file_generic " +
                         "INNER JOIN public.file_generic_data_eav ON public.file_generic.\"id\" = public.file_generic_data_eav.\"file_generic_id\" " +
                         "WHERE public.file_generic_data_eav.attribute = 'FileSize' AND public.file_generic_data_eav.value = '40 kB'")) {
                ResultSet rsEAV = selectStmt.executeQuery();
            }
        });

    }
    private DirectJsonToEavComparer test3() throws InterruptedException, SQLException {

        var c = this.createAndGetComparer("Test 3");

        //Use of Khangs Data dump -> has to be loaded into the database
        HikariDataSource dataSource = registry.getDatabaseProvider().getHikariDataSource();
        String dir_path = "G:/";


        System.out.println("Start Test(3): Counting all Rows");
        c.startJsonTime();
        {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT COUNT(tree_walk_id) FROM public.file_generic " +
                         "WHERE public.file_generic.sub_dir_path LIKE ?")) {
                selectStmt.setString(1, dir_path + "%");
                ResultSet rsJson = selectStmt.executeQuery();
                rsJson.next();
                //System.out.println("JsonCount = " + rsJson.getString("count"));
            }
        }
        c.endJsonTime();
        System.out.println("Benchmark: Test(3): Json = Done");

        c.startEavTime();
        {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement selectStmt = connection.prepareStatement
                     ("SELECT COUNT(file_generic.tree_walk_id)" +
                         "FROM public.file_generic " +
                         "INNER JOIN public.file_generic_data_eav ON public.file_generic.\"id\" = public.file_generic_data_eav.\"file_generic_id\" " +
                         "WHERE public.file_generic.sub_dir_path LIKE ?" +
                         "AND NOT public.file_generic.id = 0 ")) {
                selectStmt.setString(1, dir_path + "%");
                ResultSet rsEAV = selectStmt.executeQuery();
                rsEAV.next();
                //Output may have big consequences on time
                //System.out.println("EAVCount = " + rsEAV.getString("count"));
            }
        }
        c.endEavTime();
        System.out.println("Benchmark: Test(3): EAV = Done");


        return c;
    }


}
