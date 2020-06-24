package MetadataAutocompletion;

import Database.Database;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.postgresql.core.CachedQuery;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MetadataFileCache
{
    Map<String, Integer> tags = new HashMap<>();
    Map<String, Integer> tagsSorted = new HashMap<>();


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

        for (MetadataFileCache value : metadataFileCacheList)
        {
            value.tagsSorted.forEach((key, value2)->{
                tags.compute(key, (k, remapping)->{
                    if(remapping==null)return value2;
                    return remapping + value2;
                });
            });
        }

        this.tagsSorted = this.sortByValue(this.tags);




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
                String tagsString = resultSet.getString("tags");
                this.tags = new ObjectMapper().readValue(tagsString, Map.class);
                this.tagsSorted = this.sortByValue(this.tags);

            }


        }
        catch (Throwable throwables)
        {
            throwables.printStackTrace();
            throw new RuntimeException(throwables);
        }

    }

    //this method is from here: https://stackoverflow.com/a/2581754/2182302
    private <K, V extends Comparable<? super V>> Map<K, V> sortByValue(Map<K, V> map)
    {
        List<Map.Entry<K, V>> list = new ArrayList<>(map.entrySet());
        list.sort(Map.Entry.comparingByValue());

        Map<K, V> result = new LinkedHashMap<>();
        for (Map.Entry<K, V> entry : list)
        {
            result.put(entry.getKey(), entry.getValue());
        }

        return result;
    }


}
