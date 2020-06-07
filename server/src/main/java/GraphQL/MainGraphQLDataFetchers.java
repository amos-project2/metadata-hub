package GraphQL;

import Database.Database;
import GraphQL.Model.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import graphql.schema.DataFetcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;


@Singleton
public class MainGraphQLDataFetchers
{
    private static final Logger log = LoggerFactory.getLogger(MainGraphQLDataFetchers.class);
    private final Database database;

    @Inject
    public MainGraphQLDataFetchers(Database database)
    {
        this.database = database;
    }

    /**
     * Data Fetcher is used by this GraphQL Query:
     * searchForPattern(options...) : [File]
     * <p>
     * Concrete method description can be find in the schema.graphqls
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher searchForFileMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            Map<String, Object> graphQLArguments = dataFetchingEnvironment.getArguments();
            log.info("graphQLArguments: " + graphQLArguments.toString());

            final ArrayList<String> selected_attributes = dataFetchingEnvironment.getArgument(GraphQLSchemaDefinition.QUERY_SELECTED_ATTRIBUTES);

            String sqlQuery = PreparedStatementCreator.buildSQLQuery(graphQLArguments);
            log.info("SQLQuery: " + sqlQuery);
            return queryDatabase(sqlQuery, selected_attributes);
        };
    }

    @SuppressWarnings("unchecked")
    private List<File> queryDatabase(String sqlQuery, ArrayList<String> selected_attributes) throws SQLException, IOException
    {
        //HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        try (Connection connection = database.getJDBCConnection();
             PreparedStatement preparedStatement = connection.prepareStatement
                 (sqlQuery))
        {

            log.info("PreparedStatement: " + preparedStatement);
            try (ResultSet rs = preparedStatement.executeQuery())
            {

                ArrayList<File> files = new ArrayList<>();
                while (rs.next())
                {

                    String jsonFileMetadata = rs.getString(GraphQLSchemaDefinition.FILE_METADATA);
                    ArrayList<Metadatum> file_metadata = new ArrayList<>();
                    Map<String, String> db_metadata = new ObjectMapper().readValue(jsonFileMetadata, Map.class);
                    addSelectedAttributes(file_metadata, selected_attributes, db_metadata);

                    files.add(
                        new File(rs.getString(GraphQLSchemaDefinition.FILE_ID), rs.getString(GraphQLSchemaDefinition.FILE_CRAWL_ID),
                            rs.getString(GraphQLSchemaDefinition.FILE_DIR_PATH), rs.getString(GraphQLSchemaDefinition.FILE_NAME), rs.getString(GraphQLSchemaDefinition.FILE_TYPE),
                            rs.getString(GraphQLSchemaDefinition.FILE_SIZE), file_metadata, rs.getString(GraphQLSchemaDefinition.FILE_CREATION_TIME),
                            rs.getString(GraphQLSchemaDefinition.FILE_MODIFICATION_TIME), rs.getString(GraphQLSchemaDefinition.FILE_ACCESS_TIME),
                            rs.getString(GraphQLSchemaDefinition.FILE_FILE_HASH))
                    );

                }

                return files;
            }
        }
    }

    private void addSelectedAttributes(ArrayList<Metadatum> file_metadata, ArrayList<String> selected_attributes, Map<String, String> db_metadata)
    {
        if (selected_attributes == null)
        {
            for (Map.Entry<String, String> entry : db_metadata.entrySet())
            {
                String key = entry.getKey();
                Object value = String.valueOf(entry.getValue());
                file_metadata.add(new Metadatum(key, value.toString()));
            }
        }
        else
        {
            for (String attribute : selected_attributes)
            {
                String attr_value = String.valueOf(db_metadata.get(attribute));
                if (attr_value == null)
                {
                    continue;
                }
                file_metadata.add(new Metadatum(attribute, attr_value));
            }
        }
    }
}
