package GraphQL.Fetcher;

import Database.Database;
import Database.Model.DatabaseSchemaDefinition;
import GraphQL.Model.File;
import GraphQL.Model.GraphQLSchemaDefinition;
import GraphQL.Model.Metadatum;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.GraphQLException;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import org.jetbrains.annotations.NotNull;
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
    private final QueryCache queryCache;

    public SearchForFileMetadataFetcher(Database database, QueryCache queryCache)
    {
        this.database = database;
        this.queryCache = queryCache;
    }

    @Override
    @SuppressWarnings({"rawtypes"})
    public Object get(DataFetchingEnvironment dataFetchingEnvironment) throws Exception
    {

        Map<String, Object> graphQLArguments = dataFetchingEnvironment.getArguments();
        log.info("graphQLArguments: " + graphQLArguments.toString());

        final ArrayList<String> selected_attributes = dataFetchingEnvironment.getArgument(GraphQLSchemaDefinition.QUERY_SELECTED_ATTRIBUTES);

        String sqlQuery = PreparedStatementCreator.buildSQLQuery(graphQLArguments);

        GraphQL.Model.ResultSet resultSet = queryResultSet(graphQLArguments, selected_attributes, sqlQuery);

        return resultSet;
    }

    @NotNull
    private GraphQL.Model.ResultSet queryResultSet(Map<String, Object> graphQLArguments, ArrayList<String> selected_attributes, String sqlQuery) throws SQLException, IOException {

        List<File> returnFiles = null;
        int numberOfTotalFiles = 0;
        int offset = 0;
        int toIndex = 0;
        GraphQL.Model.ResultSet resultSet = null;

        //Offset is used as an argument, so the query cache gets used
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_OFFSET)){

            offset = (int) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_OFFSET);
            int limit = 0;
            if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE)){
                limit = (int) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE);
            }
            if(offset < 0 || limit < 0){
                throw new GraphQLException("Offset or Limit can't be smaller than 0!");
            }

            String cashKey = QueryCache.createCashKey(sqlQuery, selected_attributes);

            resultSet = QueryCache.getResultSetIfPresent(cashKey, offset, limit + offset);
            if( resultSet != null){
                log.info("Query Cache Hit");

                return resultSet;
            }else{
                log.info("Query Cache Miss");

                ArrayList<File> cacheFiles = null;
                int limitForCaching = limit;
                if(limitForCaching < QueryCache.getMaxLimit()){
                    limitForCaching = QueryCache.getMaxLimit();
                }
                cacheFiles = queryFilesFromDatabase(sqlQuery, selected_attributes, offset, limitForCaching);

                numberOfTotalFiles = getNumberOfTotalFiles(sqlQuery);
                QueryCache.putIntoCache(cashKey, cacheFiles, numberOfTotalFiles, offset);

                toIndex = offset + cacheFiles.size();
                if(limit == 0){
                    returnFiles = cacheFiles;
                }else{
                    if(cacheFiles.size()<limit) limit = cacheFiles.size();
                    returnFiles = cacheFiles.subList(0, limit);
                }
            }

            //No offset specified so no caching is going on
        }else{
            returnFiles = queryFilesFromDatabase(sqlQuery, selected_attributes);
            numberOfTotalFiles = returnFiles.size();
            offset = 0;
            toIndex = offset + numberOfTotalFiles;
        }

        resultSet = new GraphQL.Model.ResultSet(offset, toIndex, numberOfTotalFiles, returnFiles.size(), returnFiles);
        return resultSet;
    }

    private ArrayList<File> queryFilesFromDatabase(String sqlQuery, ArrayList<String> selected_attributes, int offset, int limit) throws IOException, SQLException {
        return queryFilesFromDatabase(sqlQuery + " OFFSET " + offset + " LIMIT " + limit, selected_attributes);
    }

    @SuppressWarnings("unchecked")
    private ArrayList<File> queryFilesFromDatabase(String sqlQuery, ArrayList<String> selected_attributes) throws SQLException, IOException
    {
        sqlQuery = "SELECT * " + sqlQuery;
        log.info("SQLQuery: " + sqlQuery);

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

    private int getNumberOfTotalFiles(String sqlQuery){

        int numberOfTotalFiles = 0;
        String countQuery = sqlQuery;

        if(sqlQuery.indexOf("ORDER") != -1){
            countQuery = sqlQuery.substring(0, sqlQuery.indexOf("ORDER"));
        }

        try(Connection connection = database.getJDBCConnection();
        PreparedStatement preparedStatement = connection.prepareStatement
            ("SELECT COUNT(*) " + countQuery)){
            try(ResultSet rs = preparedStatement.executeQuery()){
                rs.next();
                numberOfTotalFiles = rs.getInt(1);
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        return numberOfTotalFiles;
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
