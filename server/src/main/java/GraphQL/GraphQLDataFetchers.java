package GraphQL;

import Database.DatabaseProvider;
import Model.Metadatum;
import Model.File;
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
     * searchForPattern(pattern: String!, option: PatternOption!) : [File]
     *
     * Function:
     * If option == included: Searches for all files with "pattern" in their pathname
     * If option == excluded: Searches for all files without "pattern" in their pathname
     *
     * Options:
     * sel_attributes: If specified, fetches solely the selected attributes
     */
    @SuppressWarnings({"rawtypes"})
    public DataFetcher searchForFileMetadataFetcher()
    {
        return (DataFetcher<List<File>>) dataFetchingEnvironment ->
        {

            Map<String, Object> graphQLArguments = dataFetchingEnvironment.getArguments();
            log.info("graphQLArguments: " + graphQLArguments.toString());

            final ArrayList<String> selected_attributes = dataFetchingEnvironment.getArgument("sel_attributes");

            String sqlQuery = buildSQLQuery(graphQLArguments);
            System.out.println("sqlQuery: " + sqlQuery);
            return queryDatabase(sqlQuery, selected_attributes);
        };
    }

    @SuppressWarnings("unchecked")
    private String buildSQLQuery(Map<String, Object> graphQLArguments){

        //TODO SQLInjection Prevention is needed!
        //TODO Don't select every field only the wanted ones (SELECT *) -> (SELECT id, metadata...)
        StringBuilder stringBuilder = new StringBuilder("Select * From public.files ");
        if (graphQLArguments.size() > 0) {
            stringBuilder.append("WHERE ");
        } else {
            return stringBuilder.toString();
        }

        if(graphQLArguments.containsKey("file_ids")){
            List<Integer> file_ids = (List<Integer>) graphQLArguments.get("file_ids");
            stringBuilder.append(" (");
            for (int file_id : file_ids){
                stringBuilder.append(" id = ").append(file_id).append(" OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        if(graphQLArguments.containsKey("crawl_ids")){
            List<Integer> crawl_ids = (List<Integer>) graphQLArguments.get("crawl_ids");
            stringBuilder.append(" (");
            for (Integer crawl_id : crawl_ids){
                stringBuilder.append(" crawl_id = ").append(crawl_id).append(" OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        if(graphQLArguments.containsKey("dir_path")){
            String dir_path = (String) graphQLArguments.get("dir_path");
            if(graphQLArguments.containsKey("dir_path_option")){
                String dir_path_option = (String) graphQLArguments.get("dir_path_option");
                switch (dir_path_option) {
                    case "equal":
                        stringBuilder.append(" dir_path = '").append(dir_path).append("' AND ");
                        break;
                    case "included":
                        stringBuilder.append(" dir_path LIKE '%").append(dir_path).append("%' AND ");
                        break;
                    case "excluded":
                        stringBuilder.append(" dir_path NOT LIKE '%").append(dir_path).append("%' AND ");
                        break;
                    case "bigger":
                        stringBuilder.append(" dir_path < '").append(dir_path).append("' AND ");
                        break;
                    case "smaller":
                        stringBuilder.append(" dir_path > '").append(dir_path).append("' AND ");
                        break;
                    case "exists":
                        stringBuilder.append(" dir_path IS NOT NULL AND");
                        break;
                }
            }else{
                stringBuilder.append(" dir_path LIKE '%").append(dir_path).append("%' AND ");
            }
        }

        if(graphQLArguments.containsKey("file_name")){
            String file_name = (String) graphQLArguments.get("file_name");
            if(graphQLArguments.containsKey("file_name_option")){
                String file_name_option = (String) graphQLArguments.get("file_name_option");
                switch (file_name_option) {
                    case "equal":
                        stringBuilder.append(" name = '").append(file_name).append("' AND ");
                        break;
                    case "included":
                        stringBuilder.append(" name LIKE '%").append(file_name).append("%' AND ");
                        break;
                    case "excluded":
                        stringBuilder.append(" name NOT LIKE '%").append(file_name).append("%' AND ");
                        break;
                    case "bigger":
                        stringBuilder.append(" name < '").append(file_name).append("' AND ");
                        break;
                    case "smaller":
                        stringBuilder.append(" name > '").append(file_name).append("' AND ");
                        break;
                    case "exists":
                        stringBuilder.append(" dir_path IS NOT NULL AND");
                        break;
                }
            }else{
                stringBuilder.append(" name LIKE '%").append(file_name).append("%' AND ");
            }
        }

        if(graphQLArguments.containsKey("file_type")){
            stringBuilder.append(" type = '").append(graphQLArguments.get("file_type")).append("' AND ");
        }

        if(graphQLArguments.containsKey("size")){
            Integer size = (Integer) graphQLArguments.get("size");
            if(graphQLArguments.containsKey("size_option")){
                String size_option = (String) graphQLArguments.get("size_option");
                switch (size_option) {
                    case "equal":
                        stringBuilder.append(" size = ").append(size).append(" AND ");
                        break;
                    case "bigger":
                        stringBuilder.append(" size > ").append(size).append(" AND ");
                        break;
                    case "smaller":
                        stringBuilder.append(" size < ").append(size).append(" AND ");
                        break;
                }
            }else{
                stringBuilder.append(" size = ").append(graphQLArguments.get("size")).append(" AND ");
            }
        }

        if(graphQLArguments.containsKey("start_creation_time")) {
            stringBuilder.append(" creation_time >= '").append(graphQLArguments.get("start_creation_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("end_creation_time")) {
            stringBuilder.append(" creation_time < '").append(graphQLArguments.get("end_creation_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("start_access_time")) {
            stringBuilder.append(" access_time >= '").append(graphQLArguments.get("start_access_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("end_access_time")) {
            stringBuilder.append(" access_time < '").append(graphQLArguments.get("end_access_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("start_modification_time")) {
            stringBuilder.append(" modification_time >= '").append(graphQLArguments.get("start_modification_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("end_modification_time")) {
            stringBuilder.append(" modification_time < '").append(graphQLArguments.get("end_modification_time")).append("' AND ");
        }

        if(graphQLArguments.containsKey("file_hashes")){
            List<String> file_hashes = (List<String>) graphQLArguments.get("file_hashes");
            stringBuilder.append(" (");
            for (String file_hash : file_hashes){
                stringBuilder.append(" file_hash = '").append(file_hash).append("' OR ");
            }
            stringBuilder.append("FALSE ) AND ");
        }

        //METADATA
        //TODO Maybe there is a more beautiful solution using GraphQL, than using 3 separate lists
        if(graphQLArguments.containsKey("metadata_attributes") && graphQLArguments.containsKey("metadata_values")){
            List<String> metadata_attributes = (List<String>) graphQLArguments.get("metadata_attributes");
            List<String> metadata_values = (List<String>) graphQLArguments.get("metadata_values");
            if(metadata_attributes.size() == metadata_values.size()){
                if(graphQLArguments.containsKey("metadata_options")){
                    List<String> metadata_options = (List<String>) graphQLArguments.get("metadata_options");
                    if(metadata_options.size() == metadata_values.size()){
                        for(int i = 0; i < metadata_attributes.size(); i++){
                            String metadata_option = metadata_options.get(i);
                            switch (metadata_option){
                                case "equal":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                        .append("'::text = '").append(metadata_values.get(i)). append("' AND ");
                                    break;
                                case "included":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                        .append("'::text LIKE '%").append(metadata_values.get(i)). append("%' AND ");
                                    break;
                                case "excluded":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                        .append("'::text NOT LIKE '%").append(metadata_values.get(i)). append("%' AND ");
                                    break;
                                case "bigger":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                        .append("'::text < '").append(metadata_values.get(i)).append("' AND ");
                                    break;
                                case "smaller":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                        .append("'::text > '").append(metadata_values.get(i)).append("' AND ");
                                    break;
                                case "exists":
                                    stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                                    .append("IS NOT NULL AND ");
                                    break;
                            }
                        }
                    }
                }else{
                    for(int i = 0; i < metadata_attributes.size(); i++){
                        stringBuilder.append(" metadata ->> '").append(metadata_attributes.get(i))
                            .append("' LIKE '%").append(metadata_values.get(i)). append("%' AND ");
                    }
                }
            }
        }

        if(graphQLArguments.containsKey("limitFetchingSize")) {
            stringBuilder.append(" FETCH FIRST ").append(graphQLArguments.get("limitFetchingSize")).append(" AND ");
        }

            stringBuilder.append(" TRUE");
        return stringBuilder.toString();
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
                Object value = entry.getValue();
                file_metadata.add(new Metadatum(key, value.toString()));
            }
        }
        else
        {
            for (String attribute : selection_attributes)
            {
                String attr_value = attribute_map.get(attribute);
                if(attr_value == null)
                {
                    continue;
                }
                file_metadata.add(new Metadatum(attribute, attr_value));
            }
        }
    }
}
