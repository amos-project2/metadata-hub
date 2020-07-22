package QueryServices.MetadataAutocompletion;

import Database.Database;
import Database.Model.MetadataInfo;
import Database.Model.MetadatumValueDatatype;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
public class MetadataInfoCache
{
    private static final Logger log = LoggerFactory.getLogger(MetadataInfoCache.class);
    private Map<String, MetadataInfo> tagsSorted = new LinkedHashMap<>();

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

                LinkedHashMap<String, MetadataInfo> tmpMap = convertToMetadataInfoMap(metadataMap);

                this.tagsSorted = sortByTagOccurrence(tmpMap);
            }
        }
        catch (Throwable throwable)
        {
            log.error("metadata info cache error", throwable);
            throw new RuntimeException(throwable);
        }
    }

    public MetadataInfoCache(List<String> fileTypes, ConcurrentHashMap<String, MetadataInfoCache> cache, Database database)
    {
        ArrayList<MetadataInfoCache> metadataInfoCacheList = new ArrayList<>();
        for (String fileType : fileTypes)
        {
            metadataInfoCacheList.add(cache.computeIfAbsent(fileType, (key) -> { return new MetadataInfoCache(fileType, database); }));
        }

        HashMap<String, MetadataInfo> tags = new HashMap<>();
        for (MetadataInfoCache infoCache : metadataInfoCacheList)
        {
            infoCache.tagsSorted.forEach((tag, metadataInfo) ->
            {
                tags.compute(tag, (k, metadataInfo2) ->
                {
                    if (metadataInfo2 == null) return metadataInfo.copy();

                    return metadataInfo2.merge(metadataInfo);
                });
            });
        }

        this.tagsSorted = sortByTagOccurrence(tags);
    }

    /**
     * converts the database output into a map of MetadataInfo objects with the attribute name as key
     */
    private LinkedHashMap<String, MetadataInfo> convertToMetadataInfoMap(Map<String, ArrayList> metadataMap)
    {
        LinkedHashMap<String, MetadataInfo> metadataInfoMap = new LinkedHashMap<>();

        for (Map.Entry<String, ArrayList> entry : metadataMap.entrySet())
        {
            metadataInfoMap.put(entry.getKey(), new MetadataInfo(entry.getKey(), (Integer) entry.getValue().get(0), MetadatumValueDatatype.valueOf((String) entry.getValue().get(1))));
        }
        return metadataInfoMap;
    }

    private static LinkedHashMap<String, MetadataInfo> sortByTagOccurrence(HashMap<String, MetadataInfo> map) {
        List<Map.Entry<String, MetadataInfo>> list = new LinkedList<>(map.entrySet());

        Collections.sort(list, Comparator.comparing(Map.Entry::getValue));

        LinkedHashMap<String, MetadataInfo> sortedMap = new LinkedHashMap<>();
        for (Map.Entry<String, MetadataInfo> entry : list) {
            sortedMap.put(entry.getKey(), entry.getValue());
        }
        return sortedMap;
    }
}
