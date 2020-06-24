package GraphQL.Fetcher;

import Database.Database;
import Database.Database.*;
import Database.DatabaseSchemaDefinition;
import GraphQL.Model.File;
import GraphQL.Model.GraphQLSchemaDefinition;
import GraphQL.Model.Metadatum;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SearchForFileMetadataFetcher implements DataFetcher
{

    private static final Logger log = LoggerFactory.getLogger(SearchForFileMetadataFetcher.class);

    private final Database database;

    public SearchForFileMetadataFetcher(Database database)
    {
        this.database = database;
    }

    @Override
    @SuppressWarnings({"rawtypes"})
    public Object get(DataFetchingEnvironment dataFetchingEnvironment) throws Exception
    {

        Map<String, Object> graphQLArguments = dataFetchingEnvironment.getArguments();
        log.info("graphQLArguments: " + graphQLArguments.toString());

        final ArrayList<String> selected_attributes = dataFetchingEnvironment.getArgument(GraphQLSchemaDefinition.QUERY_SELECTED_ATTRIBUTES);

        String sqlQuery = PreparedStatementCreator.buildSQLQuery(graphQLArguments);
        log.info("SQLQuery: " + sqlQuery);
        return queryDatabase(sqlQuery, selected_attributes);
    };

    @SuppressWarnings("unchecked")
    private List<File> queryDatabase(String sqlQuery, ArrayList<String> selected_attributes) throws SQLException, IOException
    {
        //HikariDataSource dataSource = databaseProvider.getHikariDataSource();

        try (Connection connection = database.getJDBCConnection();
             PreparedStatement preparedStatement = connection.prepareStatement
                 (sqlQuery))
        {

            //log.info("PreparedStatement: " + preparedStatement);
            try (ResultSet rs = preparedStatement.executeQuery())
            {

                ArrayList<File> files = new ArrayList<>();
                while (rs.next())
                {

                    String jsonFileMetadata = rs.getString(DatabaseSchemaDefinition.FILES_METADATA);
                    ArrayList<Metadatum> file_metadata = new ArrayList<>();
                    Map<String, String> db_metadata = new ObjectMapper().readValue(jsonFileMetadata, Map.class);
                    addSelectedAttributes(file_metadata, selected_attributes, db_metadata);


                    files.add(
                        new File(rs.getString(DatabaseSchemaDefinition.FILES_ID), rs.getString(DatabaseSchemaDefinition.FILES_CRAWL_ID),
                            rs.getString(DatabaseSchemaDefinition.FILES_DIR_PATH), rs.getString(DatabaseSchemaDefinition.FILES_NAME), rs.getString(DatabaseSchemaDefinition.FILES_TYPE),
                            rs.getString(DatabaseSchemaDefinition.FILES_SIZE), file_metadata, rs.getString(DatabaseSchemaDefinition.FILES_CREATION_TIME),
                            rs.getString(DatabaseSchemaDefinition.FILES_MODIFICATION_TIME), rs.getString(DatabaseSchemaDefinition.FILES_ACCESS_TIME),
                            rs.getString(DatabaseSchemaDefinition.FILES_FILE_HASH), rs.getBoolean(DatabaseSchemaDefinition.FILES_DELETED))
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
