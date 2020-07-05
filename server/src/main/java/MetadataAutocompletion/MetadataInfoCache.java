package MetadataAutocompletion;

import Database.Database;
import Database.Model.MetadataInfo;
import Database.Model.MetadatumValueDatatype;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
public class MetadataInfoCache
{
    private List<MetadataInfo> metadataTags = new ArrayList<>();
    //TODO find a better way of sorting, than a map sorted by its values?
    private Map<String, MetadataInfo> tagsSorted = new HashMap<>();


    public MetadataInfoCache(String fileType, Database database)
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
//                this.tagsSorted = this.sortByAttributeOccurence(this.metadataTags);
            }
        }
        catch (Throwable throwables)
        {
            throwables.printStackTrace();
            throw new RuntimeException(throwables);
        }
    }

    public MetadataInfoCache(List<String> fileTypes, ConcurrentHashMap<String, MetadataInfoCache> cache, Database database)
    {
        ArrayList<MetadataInfoCache> metadataInfoCacheList = new ArrayList<>();
        for (String fileType : fileTypes)
        {
            metadataInfoCacheList.add(cache.computeIfAbsent(fileType, (key) -> { return new MetadataInfoCache(fileType, database); }));
        }

        //be careful DatabaseSchemaMetadatum is for performance reasons not in-mutable
        //so a deep-copy is necessary if we want to change the data in another context
        Map<String, MetadataInfo> tags = new HashMap<>();
        for (MetadataInfoCache infoCache : metadataInfoCacheList)
        {
            infoCache.tagsSorted.forEach((tag, metadataInfo) ->
            {
                tags.compute(tag, (k, metadataInfo2) ->
                {
                    //add DatabaseSchemaMetadatum if key not exists
                    if (metadataInfo2 == null) return metadataInfo.copy();

                    //if exists -> merge it
                    return metadataInfo2.merge(metadataInfo);
                });
            });
        }

        //TODO sort tags and save the result into a list or map
        this.tagsSorted = tags; //its unsorted //TODO sort it or refactor it to a list

        //TODO notice: metadataTags is empty here
        //   this.tagsSorted = createSortedMap(this.metadataTags);
//        this.tagsSorted = this.sortByValue(this.metadataTags);
    }

    private List<MetadataInfo> convertToMetadataList(Map<String, ArrayList> metadataMap)
    {
        List<MetadataInfo> metadataList = new ArrayList<>();

        for (Map.Entry<String, ArrayList> entry : metadataMap.entrySet())
        {
            metadataList.add(new MetadataInfo(entry.getKey(), (Integer) entry.getValue().get(0), MetadatumValueDatatype.valueOf((String) entry.getValue().get(1))));
        }
        return metadataList;
    }

    private Map<String, MetadataInfo> createSortedMap(List<MetadataInfo> metadataList)
    {
        Map<String, MetadataInfo> sortedMap = new LinkedHashMap<>();
        for (MetadataInfo metadatum : metadataList)
        {
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
