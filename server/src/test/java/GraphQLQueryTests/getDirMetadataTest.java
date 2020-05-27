package GraphQLQueryTests;

import TestSetup.TestSetup;
import org.jooq.tools.json.JSONArray;
import org.jooq.tools.json.JSONObject;
import org.jooq.tools.json.JSONParser;
import org.jooq.tools.json.ParseException;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static org.junit.Assert.assertEquals;

public class getDirMetadataTest {

    private static Client testClient;


    @BeforeClass
    public static void setup(){
        testClient = TestSetup.testClient;
    }

    @Test
    public void testFirstDir() throws ParseException {
        WebTarget webTarget = testClient.target("http://[::]:8080/").path("graphql");
        String request = "query { getDirMetadata(dir_path:\"/testDir/\"){" +
            "\tname\n" +
            "  sub_path\n" +
            "  metadata{\n" +
            "    name\n" +
            "    value\n" +
            "  }\n" +
            " }\n" +
            "}\n";

        Response response = webTarget.request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(request, MediaType.TEXT_PLAIN_TYPE));

        String jsonString = response.readEntity(String.class);
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonString);
        //System.out.println(jsonObject.toString());
        JSONArray files = (JSONArray) ((JSONObject) jsonObject.get("data")).get("getDirMetadata");

        //Test
        assertEquals(4, files.size());
        for (int i = 0; i < files.size(); i++) {
            //System.out.println(metadata.get(i).toString());
            JSONObject file = (JSONObject) files.get(i);
            assertEquals(3, file.size());
            String fileName = (String) file.get("name");
            //Tests
            //TODO Test this in a better way? How to deal with a GraphQL List[Array] the best way?
            //TODO Maybe change the Query? Try to construct a map?
            if(fileName.equals("hund1.jpg")){
                assertEquals("/testDir/", file.get("sub_path"));
            }
            if(fileName.equals("hund4.jpg")){
                assertEquals("/testDir/crawler test 2/anotherdir/", file.get("sub_path"));
            }
        }
    }

    @Test
    public void testFirstDirEAV() throws ParseException {
        WebTarget webTarget = testClient.target("http://[::]:8080/").path("graphql");
        String request = "query { getDirMetadata(dir_path:\"/testDir/\" eav: true){" +
            "\tname\n" +
            "  sub_path\n" +
            "  metadata{\n" +
            "    name\n" +
            "    value\n" +
            "  }\n" +
            " }\n" +
            "}\n";

        Response response = webTarget.request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(request, MediaType.TEXT_PLAIN_TYPE));

        String jsonString = response.readEntity(String.class);
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonString);
        //System.out.println(jsonObject.toString());
        JSONArray files = (JSONArray) ((JSONObject) jsonObject.get("data")).get("getDirMetadata");

        //Test
        assertEquals(1, files.size());
        for (int i = 0; i < files.size(); i++) {
            JSONObject file = (JSONObject) files.get(i);
            System.out.println(file.toString());
            assertEquals(3, file.size());
            String fileName = (String) file.get("name");
            //Tests
            //TODO EAV data different to file table so the EAV Query combines 2 differently name files
            if(fileName.equals("hund1.jpg")){
                assertEquals("/testDir/", file.get("sub_path"));
            }
            if(fileName.equals("hund4.jpg")){
                assertEquals("/testDir/crawler test 2/anotherdir/", file.get("sub_path"));
            }
        }
    }
}
