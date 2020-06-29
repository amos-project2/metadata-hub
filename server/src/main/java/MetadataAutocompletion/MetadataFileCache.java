package MetadataAutocompletion;
import Database.Database;
import Database.Model.DatabaseSchemaMetadatum;
import Database.Model.MetadatumValueDatatype;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter @Setter
public class MetadataFileCache
{
    private List<DatabaseSchemaMetadatum> metadataTags = new ArrayList<>();
    //TODO find a better way of sorting, than a map sorted by its values?
    private Map<String, DatabaseSchemaMetadatum> tagsSorted = new HashMap<>();


    public MetadataFileCache(List<String> fileTypes, ConcurrentHashMap<String, MetadataFileCache> cache, Database database)
    {
        ArrayList<MetadataFileCache> metadataFileCacheList = new ArrayList<>();
        for (String value : fileTypes)
        {
            metadataFileCacheList.add(cache.computeIfAbsent(value, (key) ->
            {
                return new MetadataFileCache(value, database);
            }));
        }

        //TODO What does this do?
//        for (MetadataFileCache value : metadataFileCacheList)
//        {
//            value.tagsSorted.forEach((key, value2)->{
//                metadataTags.compute(key, (k, remapping)->{
//                    if(remapping==null)return value2;
//                    return remapping + value2;
//                });
//            });
//        }

        Map<String, DatabaseSchemaMetadatum> tags = new HashMap<>();
        for (MetadataFileCache value : metadataFileCacheList)
        {
            value.tagsSorted.forEach((key2, value2)->{
                tags.compute(key2, (k, remapping)->{

                    //add DatabaseSchemaMetadatum if key not exists
                    if(remapping==null)return value2;

                    //if exists -> merge it
                    return remapping.merge(value2);
                });
            });
        }


        //TODO sort tags and save the result into a list or map

        this.tagsSorted = tags; //its unsorted //TODO sort it or refactor it to a list


        //TODO notice: metadataTags is empty here
     //   this.tagsSorted = createSortedMap(this.metadataTags);
//        this.tagsSorted = this.sortByValue(this.metadataTags);




    }

    public MetadataFileCache(String fileType, Database database)
    {
        try (Connection con = database.gC())
        {

            PreparedStatement preparedStatement = con.prepareStatement("SELECT * FROM public.metadata WHERE file_type=?");
            preparedStatement.setString(1, fileType);
            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next())
            {
                String metadataRow = resultSet.getString("tags");

                Map<String, ArrayList> metadataMap = new ObjectMapper().readValue(metadataRow, Map.class);

                this.metadataTags = convertToMetadataList(metadataMap);
                Collections.sort(metadataTags);
                this.tagsSorted = createSortedMap(this.metadataTags);
                System.out.println("List: " + metadataTags.toString());
//                this.tagsSorted = this.sortByAttributeOccurence(this.metadataTags);

            }


        }
        catch (Throwable throwables)
        {
            throwables.printStackTrace();
            throw new RuntimeException(throwables);
        }

    }

    private List<DatabaseSchemaMetadatum> convertToMetadataList(Map<String, ArrayList> metadataMap){

        List<DatabaseSchemaMetadatum> metadataList = new ArrayList<>();

        for(Map.Entry<String, ArrayList> entry: metadataMap.entrySet()){
            metadataList.add(new DatabaseSchemaMetadatum(entry.getKey(), (Integer) entry.getValue().get(0), MetadatumValueDatatype.valueOf((String) entry.getValue().get(1))));
        }
        return metadataList;
    }

    private Map<String, DatabaseSchemaMetadatum> createSortedMap(List<DatabaseSchemaMetadatum> metadataList){

        Map<String, DatabaseSchemaMetadatum> sortedMap = new LinkedHashMap<>();
        for(DatabaseSchemaMetadatum metadatum : metadataList){
            sortedMap.put(metadatum.getAttribute(), metadatum);
        }

        return sortedMap;
    }

//    private Map<String,ArrayList> sortByAttributeOccurence(Map<String, ArrayList> metadataMap){
//
//        ArrayList<Map.Entry<String, ArrayList>> sortingList = new ArrayList<>(metadataMap.entrySet());
//        sortingList.sort(comparingByMetadataAttributeOccurence());
//
//    }
//
//    private static <K, V extends Comparable<? super V>> Comparator< Map.Entry<String, ArrayList> > comparingByMetadataAttributeOccurence() {
//        return new Comparator<>() {
//            @Override
//            public int compare(Map.Entry<String, ArrayList> o1, Map.Entry<String, ArrayList> o2) {
//                return (Integer)o1.getValue().get(0) - (Integer)o2.getValue().get(0);
//            }
//        };
//    }

    //this method is from here: https://stackoverflow.com/a/2581754/2182302
//    private <K, V extends Comparable<? super V>> Map<K, V> sortByValue(Map<K, V> map)
//    {
//        List<Map.Entry<K, V>> list = new ArrayList<>(map.entrySet());
//        list.sort(Map.Entry.comparingByValue());
//
//        Map<K, V> result = new LinkedHashMap<>();
//        for (Map.Entry<K, V> entry : list)
//        {
//            System.out.println("Entry Val: " + entry.getValue());
//            result.put(entry.getKey(), entry.getValue());
//        }
//
//        return result;
//    }

}
