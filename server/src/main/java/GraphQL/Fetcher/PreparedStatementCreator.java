package GraphQL.Fetcher;

import Database.Model.DatabaseSchemaDefinition;
import GraphQL.Model.GraphQLSchemaDefinition;
import graphql.GraphQLException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PreparedStatementCreator {

    @SuppressWarnings("unchecked")
    protected static String buildSQLQuery(Map<String, Object> graphQLArguments){

        //TODO SQLInjection Prevention is needed!
        //TODO Don't select every field only the wanted ones (SELECT *) -> (SELECT id, metadata...)
//        StringBuilder stringBuilder = new StringBuilder("SELECT * FROM " + DatabaseSchemaDefinition.FILES_TABLE +  " WHERE ");
        StringBuilder stringBuilder = new StringBuilder("FROM " + DatabaseSchemaDefinition.FILES_TABLE +  " WHERE ");

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

        //file types
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_FILE_TYPES)){
            List<String> file_types = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_FILE_TYPES);
            stringBuilder.append(" (");
            for(String file_type : file_types){
                stringBuilder.append(DatabaseSchemaDefinition.FILES_TYPE + " = '" + file_type + "' OR ");
            }
            stringBuilder.append("FALSE ) AND ");
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
        //TODO Maybe there is a more beautiful solution using GraphQL, than using separate lists
        buildMetadataFilter(graphQLArguments, stringBuilder);

        //Show deleted files
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SHOW_DELETED)){
            if(!((Boolean) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SHOW_DELETED))) {
                stringBuilder.append(DatabaseSchemaDefinition.FILES_DELETED + " = FALSE AND ");
            }
        }else {
            stringBuilder.append(DatabaseSchemaDefinition.FILES_DELETED + " = FALSE AND ");
        }

        stringBuilder.append(" TRUE");

        //Order the result on different attributes depending on different sort options
        //TODO: check if attributes are valid Database attributes?
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SORT_BY_ATTRIBUTES)){
            List<String> sortBy_attributes = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SORT_BY_ATTRIBUTES);
            stringBuilder.append(" ORDER BY ");

            if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_SORT_BY_OPTIONS)){
                List<String> sortBy_options = (List<String>) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_SORT_BY_OPTIONS);

                if(sortBy_attributes.size() == sortBy_options.size()){
                    for(int i = 0; i < (sortBy_attributes.size() - 1); i++){
                        stringBuilder.append(sortBy_attributes.get(i) + " " + sortBy_options.get(i) + " , ");
                    }
                    stringBuilder.append(sortBy_attributes.get(sortBy_attributes.size() - 1) + " " + sortBy_options.get(sortBy_options.size() - 1) + " ");
                    //sizes of attribute and option list differs, all options get ignored
                } else {
                    for(int i = 0; i < (sortBy_attributes.size() - 1); i++){
                        stringBuilder.append(sortBy_attributes.get(i) + " , ");
                    }
                    stringBuilder.append(sortBy_attributes.get(sortBy_attributes.size() - 1) + " ");
                }

                // no sortBy_options declared
            } else {
                for(int i = 0; i < (sortBy_attributes.size() - 1); i++){
                    stringBuilder.append(sortBy_attributes.get(i) + " , ");
                }
                stringBuilder.append(sortBy_attributes.get(sortBy_attributes.size() - 1) + " ");
            }

            // If limit or offset are used the result also needs to get sorted to be sure that one can iterate over the result set.
            // otherwise postgreSQL doesn't secure a predictable result set
        } else if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE) || graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_OFFSET)){
            stringBuilder.append(" ORDER BY " + DatabaseSchemaDefinition.FILES_NAME + " ");
        }

        //Only fetch a certain amount of rows
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE) && !(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_OFFSET))) {
            stringBuilder.append(" LIMIT " + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_LIMIT_FETCHING_SIZE));
        }

//        //Ignores all rows of result till offset
//        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_OFFSET)){
//            stringBuilder.append(" OFFSET " + graphQLArguments.get(GraphQLSchemaDefinition.QUERY_OFFSET));
//        }

        return stringBuilder.toString();
    }

    @SuppressWarnings("StringConcatenationInsideStringBufferAppend")
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

    /**
     * The metadata filters specified in the graphQLArguments get built into a String that can be used in SQL statements
     * and appended to stringBuilder
     * Notice: The operator alias jsonb_exists() is used cause the operator "?" breaks the PreparedStatement
     */
    private static void buildMetadataFilter(Map<String, Object> graphQLArguments, StringBuilder stringBuilder) {
        Map<Integer, String> metadata_filters = new HashMap<>();
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
                                    metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                                        "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) + "'::text = '"
                                        + metadata_values.get(i) + "' END) ");
                                    break;
                                case "included":
                                    metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                                        "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text LIKE '%" + metadata_values.get(i) + "%' END) ");
                                    break;
                                case "excluded":
                                    metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                                        "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text NOT LIKE '%" + metadata_values.get(i) + "%' END) ");
                                    break;
                                case "bigger":
                                    metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                                        "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text > '" + metadata_values.get(i) + "' END) ");
                                    break;
                                case "smaller":
                                    metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                                        "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                                        "'::text < '" + metadata_values.get(i) + "' END) ");
                                    break;
                                case "exists":
                                    metadata_filters.put(i, " jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) + "')  ");
                                    break;
                            }
                        }
                    }
                }else{
                    for(int i = 0; i < metadata_attributes.size(); i++){
                        metadata_filters.put(i, "(CASE WHEN jsonb_exists(" + DatabaseSchemaDefinition.FILES_METADATA + ", '" + metadata_attributes.get(i) +
                            "')  THEN " + DatabaseSchemaDefinition.FILES_METADATA + " ->> '" + metadata_attributes.get(i) +
                            "'::text LIKE '%" + metadata_values.get(i) + "%' END) ");
                    }
                }
            }
        }
        try{
            stringBuilder.append(buildMetadataFilterLogic(graphQLArguments, metadata_filters));
        }catch (Exception exception){
            throw new GraphQLException("Couldn't build metadata filter logic! The entered filter string is faulty!", exception);
        }
    }

    /**
     * Builds a String that can be used in a SQL statement out of the specified metadata_filters
     *
     * Concerning the custom set Filter Logic String
     * A Filter Logic String looks like this: "(f1 AND f3) OR f2 AND (f11 AND f0)"
     * The indexes in the Filter Logic String resemble the metadata filters index in the metadata_filters map
     * From Start to finish every f[x] gets substituted by a metadata filter
     */
    private static String buildMetadataFilterLogic(Map<String, Object> graphQLArguments, Map<Integer, String> metadata_filters){
       StringBuilder metadatafilterBuilder = new StringBuilder(" (");
       Map<Integer, String> unused_metadata_filters = new HashMap<>(metadata_filters);

       //Insert the metadata filters into the filter logic string to create a sql statement
       if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC)){
           String filterLogic = (String) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC);

           metadatafilterBuilder.append(filterLogic + " AND ");
           int lastFoundFilterIndex = 0;
           for(int filterIndexStart = metadatafilterBuilder.indexOf("f"); filterIndexStart != -1; filterIndexStart = metadatafilterBuilder.indexOf("f", lastFoundFilterIndex)){

               //Get the end position of the filter in the filter logic string
               int filterIndexEnd = metadatafilterBuilder.indexOf(" ", filterIndexStart);
               while(metadatafilterBuilder.charAt(filterIndexEnd-1) == ')'){
                   filterIndexEnd--;
               }

               //Get the index of the filter among the metadata filters
               String filterIndexString = metadatafilterBuilder.substring(filterIndexStart + 1, filterIndexEnd);
               int filterIndex =  Integer.parseInt(filterIndexString);

               if( !metadata_filters.containsKey(filterIndex)){
                   throw new GraphQLException(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC + ": Specified filter index [" + filterIndex + "] couldn't be found in metadata filters. Maybe out of range.");
               }

               String filter = metadata_filters.get(filterIndex);
               unused_metadata_filters.remove(filterIndex);

               //Remember how far the filter logic String got analyzed
               lastFoundFilterIndex = filterIndexStart  + filter.length();

               //replace occurence of the filter index
               metadatafilterBuilder.replace(filterIndexStart, filterIndexStart + filterIndexString.length() + 1, filter);
           }

       }

       String logicOptions = GraphQLSchemaDefinition.FILTER_LOGIC_OPTION_AND;
       String logicalOperator = " AND ";
       Boolean isOR = false;
        if(graphQLArguments.containsKey(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC_OPTIONS)){
            logicOptions = (String) graphQLArguments.get(GraphQLSchemaDefinition.QUERY_METADATA_FILTER_LOGIC_OPTIONS);
            if(logicOptions.equals(GraphQLSchemaDefinition.FILTER_LOGIC_OPTION_OR)){
                logicalOperator = " OR ";
                isOR = true;
            }
        }

        //Add the rest of the filter options that were'nt used in the logic string
        if(!logicOptions.equals(GraphQLSchemaDefinition.FILTER_LOGIC_OPTION_ONLY_LOGIC)) {
            for (Map.Entry<Integer, String> filter : unused_metadata_filters.entrySet()) {
                metadatafilterBuilder.append(filter.getValue() + logicalOperator);
            }
        }

        if(isOR && metadata_filters.size() > 0){
            metadatafilterBuilder.append(" FALSE ");
        }else{
            metadatafilterBuilder.append(" TRUE ");
        }

        return metadatafilterBuilder.append(") AND ").toString();
    }
}
