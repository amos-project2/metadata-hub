package GraphQLQueryTests;

import TestSetup.TestSetup;
import org.jooq.JSON;
import org.jooq.tools.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

public class getFileMetadataTest {

    private static Client testClient;


    @BeforeClass
    public static void setup(){
        testClient = TestSetup.testClient;
    }

    @Test
    public void testFirstFile(){

/*
        WebTarget webTarget = testClient.target("http://[::]:8080/").path("graphql");
        String request = "query{ getFileMetadata(file_id:\"1\") { id, name, value} }";
        System.out.println("request");

        Response json = webTarget.request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(request, MediaType.APPLICATION_JSON_TYPE));

        System.out.println(json.toString());
*/


    }
}
