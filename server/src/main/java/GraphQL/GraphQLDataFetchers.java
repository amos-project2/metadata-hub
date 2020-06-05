package GraphQL;

import Database.DatabaseProvider;
import GraphQL.Model.Metadatum;
import GraphQL.Model.File;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import graphql.schema.DataFetcher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;


@RequiredArgsConstructor
public class GraphQLDataFetchers
{
    private static final Logger log = LoggerFactory.getLogger(GraphQLDataFetchers.class);
    private final DatabaseProvider databaseProvider;

    /**
     * Data Fetcher is used by this GraphQL Query:
     * searchForPattern(options...) : [File]
     *
     * Concrete method description can be find in the schema.graphqls
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher searchForFileMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            Map<String, Object> graphQLArguments = dataFetchingEnvironment.getArguments();
            log.info("graphQLArguments: " + graphQLArguments.toString());

            final ArrayList<String> selected_attributes = dataFetchingEnvironment.getArgument("selected_attributes");

            String sqlQuery = PreparedStatementCreator.buildSQLQuery(graphQLArguments);
            return queryDatabase(sqlQuery, selected_attributes);
        };
    }

    @SuppressWarnings("unchecked")
    private List<File> queryDatabase(String sqlQuery, ArrayList<String> selected_attributes) throws SQLException, IOException {
        HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement selectStmt = connection.prepareStatement
                 (sqlQuery)) {
            System.out.println(selectStmt.toString());
            try (ResultSet rs = selectStmt.executeQuery()) {
                ArrayList<File> files = new ArrayList<>();
                while (rs.next()) {
                    String jsonFileMetadata = rs.getString("metadata");
                    ArrayList<Metadatum> file_metadata = new ArrayList<>();
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> metadata_map = mapper.readValue(jsonFileMetadata, Map.class);
                    addSelectedAttributes(file_metadata, selected_attributes,  metadata_map);

                    files.add(new File(rs.getString("id"), rs.getString("crawl_id"),
                        rs.getString("dir_path"), rs.getString("name"), rs.getString("type"),
                        rs.getString("size") ,file_metadata, rs.getString("creation_time"), rs.getString("modification_time"),
                        rs.getString("access_time"), rs.getString("file_hash")));

                }

                return files;
            }
        }
    }

    private void addSelectedAttributes(ArrayList<Metadatum> file_metadata, ArrayList<String> selection_attributes, Map<String, String> attribute_map) {
        if (selection_attributes == null)
        {
            for (Map.Entry<String, String> entry : attribute_map.entrySet())
            {
                String key = entry.getKey();
                Object value = String.valueOf(entry.getValue());
                file_metadata.add(new Metadatum(key, value.toString()));
            }
        }
        else
        {
            for (String attribute : selection_attributes)
            {
                String attr_value = String.valueOf(attribute_map.get(attribute));
                if(attr_value == null)
                {
                    continue;
                }
                file_metadata.add(new Metadatum(attribute, attr_value));
            }
        }
    }
}
