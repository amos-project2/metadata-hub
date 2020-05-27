package GraphQLQueryTests;

import TestSetup.TestSetup;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jooq.JSON;
import org.jooq.meta.derby.sys.Sys;
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
import java.io.IOException;


import static org.junit.Assert.assertEquals;

public class getFileMetadataTest {

    private static Client testClient;


    @BeforeClass
    public static void setup(){
        testClient = TestSetup.testClient;
    }

    @Test
    public void testFirstFile() throws IOException, ParseException {

        WebTarget webTarget = testClient.target("http://[::]:8080/").path("graphql");
        String request = "query{ getFileMetadata(file_id:\"1\") { id, name, value} }";

        Response response = webTarget.request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(request, MediaType.TEXT_PLAIN_TYPE));

        String jsonString = response.readEntity(String.class);
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonString);
        //System.out.println(jsonObject.toString());
        JSONArray metadata = (JSONArray) ((JSONObject) jsonObject.get("data")).get("getFileMetadata");

        //Test
        assertEquals(24, metadata.size());
        for (int i = 0; i < metadata.size(); i++) {
            //System.out.println(metadata.get(i).toString());
            JSONObject metadatum = (JSONObject) metadata.get(i);
            String metadatumName = (String) metadatum.get("name");
            //Tests
            if(metadatumName.equals("FileName")){
                assertEquals("<No AttributeID, when the EAV_Table isn't used", metadatum.get("id"));
                assertEquals("hund1.jpg", metadatum.get("value"));
            }
            if(metadatumName.equals("FileSize")){
                assertEquals("7.1 kB", metadatum.get("value"));
            }
            if(metadatumName.equals("Directory")){
                assertEquals("../../testDir/crawler test 2", metadatum.get("value"));
            }
        }
    }

    @Test
    public void testFirstFileEAV() throws ParseException {

        WebTarget webTarget = testClient.target("http://[::]:8080/").path("graphql");
        String request = "query{ getFileMetadata(file_id:\"1\" eav: true) { id, name, value} }";

        Response response = webTarget.request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(request, MediaType.TEXT_PLAIN_TYPE));

        String jsonString = response.readEntity(String.class);
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonString);
        //System.out.println(jsonObject.toString());
        JSONArray metadata = (JSONArray) ((JSONObject) jsonObject.get("data")).get("getFileMetadata");

        //Test
        assertEquals(24, metadata.size());
        for (int i = 0; i < metadata.size(); i++) {
            //System.out.println(metadata.get(i).toString());
            JSONObject metadatum = (JSONObject) metadata.get(i);
            String metadatumName = (String) metadatum.get("name");
            //Tests
            if(metadatumName.equals("FileName")){
                assertEquals("3", metadatum.get("id"));
                //TODO different names in FileTable and EAVTable correct testdata
                assertEquals("hund.jpg", metadatum.get("value"));
            }
            if(metadatumName.equals("FileSize")){
                assertEquals("7.1 kB", metadatum.get("value"));
            }
            if(metadatumName.equals("Directory")){
                assertEquals("../../testDir/crawler test 2", metadatum.get("value"));
            }
        }
    }
}
