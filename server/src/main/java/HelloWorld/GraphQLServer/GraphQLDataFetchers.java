package HelloWorld.GraphQLServer;

import com.google.common.collect.ImmutableMap;
import graphql.schema.DataFetcher;

import java.util.Arrays;
import java.util.List;
import java.util.Map;


public class GraphQLDataFetchers
{

    //A REAL DATABASE :)
    private static List<Map<String, String>> worlds = Arrays.asList(
        ImmutableMap.of("name", "world",
            "greeting", "hello")
    );

    private static List<Map<String, String>> humans = Arrays.asList(
        ImmutableMap.of("first_name", "Peter",
            "last_name", "Koch")
    );

    public DataFetcher getGreetingFetcher()
    {
        return dataFetchingEnvironment -> {
            String worldName = dataFetchingEnvironment.getArgument("name");
            return worlds
                .stream().filter(world -> world.get("name").equals(worldName))
                .findFirst()
                .orElse(null);
        };
    }
}
