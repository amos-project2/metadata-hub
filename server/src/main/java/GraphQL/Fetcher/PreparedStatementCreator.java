package GraphQL.Fetcher;

import Database.DatabaseSchemaDefinition;
import GraphQL.Model.GraphQLSchemaDefinition;
import com.google.common.graph.Graph;
import graphql.GraphQLException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PreparedStatementCreator {

    @SuppressWarnings("unchecked")
    protected static String buildSQLQuery(Map<String, Object> graphQLArguments){

        //TODO SQLInjection Prevention is needed!
        //TODO Don't select every field only the wanted ones (SELECT *) -> (SELECT id, metadata...)
        StringBuilder stringBuilder = new StringBuilder("SELECT * FROM " + DatabaseSchemaDefinition.FILES_TABLE +  " WHERE ");

        //file_ids
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_FILES_IDS)){
            List<Integer> file_ids = (List<Integer>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_FILES_IDS);
            stringBuilder.append(" (");
            for (int file_id : file_ids){
                stringBuilder.append(DatabaseSchemaDefinition.FILES_ID + " = " + file_id + " OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        //crawl_ids
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_CRAWL_IDS)){
            List<Integer> crawl_ids = (List<Integer>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_CRAWL_IDS);
            stringBuilder.append(" (");
            for (Integer crawl_id : crawl_ids){
                stringBuilder.append(DatabaseSchemaDefinition.FILES_CRAWL_ID + " = ").append(crawl_id).append(" OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        //dir_path
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_DIR_PATH)){
            createWithOptions(graphQLArguments, GraphQLSchemaDefinition.QUERY_DIR_PATH, GraphQLSchemaDefinition.QUERY_DIR_PATH_OPTION, DatabaseSchemaDefinition.FILES_DIR_PATH, stringBuilder);
        }

        //file_name
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_FILE_NAME)){
            createWithOptions(graphQLArguments, GraphQLSchemaDefinition.QUERY_FILE_NAME, GraphQLSchemaDefinition.QUERY_FILE_NAME_OPTION, DatabaseSchemaDefinition.FILES_NAME, stringBuilder);
        }

        //type
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_FILE_TYPE)){
            stringBuilder.append(DatabaseSchemaDefinition.FILES_TYPE + " = '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_FILE_TYPE) + "' AND ");
        }

        //size
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SIZE)){
            Integer size = (Integer) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SIZE);
            if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SIZE_OPTION)){
                String size_option = (String) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SIZE_OPTION);
                switch (size_option) {
                    case "equal":
                        stringBuilder.append(DatabaseSchemaDefinition.FILES_SIZE + " = " + size + " AND ");
                        break;
                    case "bigger":
                        stringBuilder.append(DatabaseSchemaDefinition.FILES_SIZE + " > " + size + " AND ");
                        break;
                    case "smaller":
                        stringBuilder.append(DatabaseSchemaDefinition.FILES_SIZE + " < " + size + " AND ");
                        break;
                }
            }else{
                stringBuilder.append(DatabaseSchemaDefinition.FILES_SIZE + " = " + size + " AND ");
            }
        }

        //times
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_START_CREATION_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_CREATION_TIME + " >= '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_START_CREATION_TIME) + "' AND ");
        }

        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_END_CREATION_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_CREATION_TIME + " < '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_END_CREATION_TIME) + "' AND ");
        }

        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_START_ACCESS_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_ACCESS_TIME + " >= '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_START_ACCESS_TIME) + "' AND ");
        }

        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_END_ACCESS_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_ACCESS_TIME + " < '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_END_ACCESS_TIME) + "' AND ");
        }

        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_START_MODIFICATION_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_MODIFICATION_TIME + " >= '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_START_MODIFICATION_TIME) + "' AND ");
        }

        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_END_MODIFICATION_TIME)) {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_MODIFICATION_TIME + " < '" + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_END_MODIFICATION_TIME) + "' AND ");
        }

        //hashes
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_FILE_HASHES)){
            List<String> file_hashes = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_FILE_HASHES);
            stringBuilder.append(" (");
            for (String file_hash : file_hashes){
                stringBuilder.append(DatabaseSchemaDefinition.FILES_FILE_HASH + " = '" + file_hash + "' OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        //METADATA
        //TODO Maybe there is a more beautiful solution using GraphQL, than using 2 separate lists

        Map<Integer, String> metadata_filter = new HashMap<Integer, String>();
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_ATTRIBUTES) && graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_VALUES)){
            List<String> metadata_attributes = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_ATTRIBUTES);
            List<String> metadata_values = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_VALUES);
            if(metadata_attributes.size() == metadata_values.size()){
                if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_OPTIONS)){
                    List<String> metadata_options = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_OPTIONS);
                    if(metadata_options.size() == metadata_values.size()){
                        for(int i = 0; i < metadata_attributes.size(); i++){
                            String metadata_option = metadata_options.get(i);
                            switch (metadata_option){
                                case "equal":
                                    metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) + "'::text = '"
                                        + metadata_values.get(i) + "' ELSE TRUE END) ");
                                    break;
                                case "included":
                                    metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text LIKE '%" + metadata_values.get(i) + "%' ELSE TRUE END) ");
                                    break;
                                case "excluded":
                                    metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text NOT LIKE '%" + metadata_values.get(i) + "%' ELSE TRUE END) ");
                                    break;
                                case "bigger":
                                    metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text > '" + metadata_values.get(i) + "' ELSE TRUE END) ");
                                    break;
                                case "smaller":
                                    metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text < '" + metadata_values.get(i) + "' ELSE TRUE END) ");
                                    break;
                                case "exists":
                                    metadata_filter.put(i, DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) + "' IS NOT NULL ");
                                    break;
                            }
                        }
                    }
                }else{
                    for(int i = 0; i < metadata_attributes.size(); i++){
                        metadata_filter.put(i, "(CASE WHEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                            "' IS NOT NULL THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                            "'::text LIKE '%" + metadata_values.get(i) + "%' ELSE TRUE END) ");
                    }
                }
            }
        }
        stringBuilder.append(buildMetadataFilter(graphQLArguments, metadata_filter));

        //Show deleted files
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SHOW_DELETED)){
            if(!((Boolean) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SHOW_DELETED))) {
                stringBuilder.append(DatabaseSchemaDefinition.FILES_DELETED + " = FALSE AND ");
            }
        }else {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_DELETED + " = FALSE AND ");
        }

        stringBuilder.append(" TRUE");

        //Only fetch a certain amount of rows
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE)) {
            stringBuilder.append(" FETCH FIRST " + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE) + " ROWS ONLY");
        }

        return stringBuilder.toString();
    }

    private static void createWithOptions(Map<String, Object> graphQLArguments, String queryParam, String queryOption, String databaseField, StringBuilder stringBuilder) {
        String value = (String) graphQLArguments.get(queryParam);
        if(graphQLArguments.containsKey(queryOption)){
            String option = (String) graphQLArguments.get(queryOption);
            switch (option) {
                case "equal":
                    stringBuilder.append(databaseField + " = '" + value + "' AND ");
                    break;
                case "included":
                    stringBuilder.append(databaseField + " LIKE '%" + value + "%' AND ");
                    break;
                case "excluded":
                    stringBuilder.append(databaseField + " NOT LIKE '%" + value + "%' AND ");
                    break;
                case "bigger":
                    stringBuilder.append(databaseField + " > '" + value + "' AND ");
                    break;
                case "smaller":
                    stringBuilder.append(databaseField + " < '" + value + "' AND ");
                    break;
                case "exists":
                    stringBuilder.append(databaseField + " IS NOT NULL AND ");
                    break;
            }
        }else{
            stringBuilder.append(databaseField + " LIKE '%" + value + "%' AND ");
        }
    }

    private static String buildMetadataFilter(Map<String, Object> graphQLArguments, Map<Integer, String> metadata_filter){
       StringBuilder metadatafilterBuilder = new StringBuilder(" ");

       if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC)){
           String filterLogic = (String) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC);

           metadatafilterBuilder.append(filterLogic + " AND ");
           for(int filterIndexStart = metadatafilterBuilder.indexOf("f"); filterIndexStart != -1; filterIndexStart = metadatafilterBuilder.indexOf("f")){
               int filterIndexEnd = metadatafilterBuilder.indexOf(" ", filterIndexStart);
               int filterIndex =  Integer.parseInt(metadatafilterBuilder.substring(filterIndexStart + 1, filterIndexEnd));

               if( !metadata_filter.containsKey(filterIndex)){
                   throw new GraphQLException(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC + ": Specified filter index couldn't be found in metadata filters");
               }

               String filter = metadata_filter.remove(filterIndex);
               metadatafilterBuilder.replace(filterIndexStart, filterIndexEnd, filter);
           }

       }

       for(Map.Entry<Integer, String> filter : metadata_filter.entrySet()){
           metadatafilterBuilder.append(filter.getValue() + " AND ");
       }

       return metadatafilterBuilder.toString();
    }
}
