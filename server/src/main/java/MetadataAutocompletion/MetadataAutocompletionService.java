package MetadataAutocompletion;

import Database.Database;
import Database.Model.MetadataInfo;
import com.google.inject.Inject;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service-Class
 */
public class MetadataAutocompletionService
{
    private final Database database;
    private final ConcurrentHashMap<String, MetadataFileCache> cache = new ConcurrentHashMap<>();


    @Inject
    public MetadataAutocompletionService(Database database)
    {
        this.database = database;
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(this::cleanCache, 1, 1, TimeUnit.HOURS);
    }


    //it is ok having here so much arguments, because its a request-method -> a refactor to an request-object as input would be possible
    public List<String> request(List<String> fileTypes, List<String> usedSearch, String search, int count, boolean fillToCount)
    {
        System.out.println(fileTypes + "BLA");
        System.out.println(fileTypes.size());

        String fileTypesAsString = this.getFileTypesAsConcatenatedString(fileTypes);
        MetadataFileCache metadataFileCache = getMetadataInfoCache(fileTypes, fileTypesAsString);


        ArrayList<String> result = new ArrayList<>();
        ArrayList<String> resultBackup = new ArrayList<>();
        AtomicInteger counter = new AtomicInteger(0);//TODO replace through a cheaper Integer-Wrapper, cause atomic is here not necessary
        Map<String, MetadataInfo> sortedTagsMap = metadataFileCache.getTagsSorted();
        sortedTagsMap.forEach((key, value) ->
        {
            if (counter.get() >= count) return;
            if (usedSearch.contains(key.toLowerCase())) return;
            if (search != null)
            {

                if (!(key.toLowerCase().contains(search.toLowerCase())))
                {
                    resultBackup.add(key);
                    return;
                }
            }

            counter.incrementAndGet();
            result.add(key);
        });

        if (fillToCount)
        {
            while (result.size() < count)
            {
                if (resultBackup.size() == 0) break;
                result.add(resultBackup.get(0));
                resultBackup.remove(0);
            }
        }

        System.out.println(result.toString());
        return result;

    }

    public List<String> request(List<String> fileTypes, long limit, long offset)
    {
        String fileTypesAsString = this.getFileTypesAsConcatenatedString(fileTypes);
        MetadataFileCache metadataFileCache = getMetadataInfoCache(fileTypes, fileTypesAsString);
        ArrayList<String> result = new ArrayList<>();

        Map<String, MetadataInfo> sortedTagsMap = metadataFileCache.getTagsSorted();

        //Todo replace through a cheaper final-wrapper;
        AtomicLong offsetCounter = new AtomicLong(0);
        AtomicLong limitCounter = new AtomicLong(0);
        sortedTagsMap.forEach((key, value) ->
        {
            //TODO maybe refactor to a normal for-loop, that we can abbort directly
            if (offsetCounter.getAndIncrement() < offset) return;
            if (limitCounter.incrementAndGet() > limit) return;

            result.add(key);

        });

        return result;
    }


    public String getMetadataDatatype(List<String> fileTypes, String metadataTag)
    {

        String fileTypesID = getFileTypesAsConcatenatedString(fileTypes);
        MetadataFileCache metadataInfoCache = getMetadataInfoCache(fileTypes, fileTypesID);

        String datatype = metadataInfoCache.getTagsSorted().get(metadataTag).getValueDatatype().toString();

        return datatype;
    }

    @NotNull
    private MetadataFileCache getMetadataInfoCache(List<String> fileTypes, String fileTypesAsString)
    {
        MetadataFileCache metadataFileCache;//synchronized (this) //not needed i think
        {
            //TODO all-fileTypes
            //fallback for now to jpg
            if (fileTypes.size() == 0)
            {
                metadataFileCache = cache.computeIfAbsent(fileTypesAsString, (key) ->
                {
                    return new MetadataFileCache("JPEG", this.database);
                });
            }
            else if (fileTypes.size() == 1)
            {
                metadataFileCache = cache.computeIfAbsent(fileTypesAsString, (key) ->
                {
                    return new MetadataFileCache(fileTypes.get(0), this.database);
                });
            }
            else
            {
                metadataFileCache = cache.computeIfAbsent(fileTypesAsString, (key) ->
                {
                    return new MetadataFileCache(fileTypes, cache, database);
                });
            }

        }
        return metadataFileCache;
    }

    private String getFileTypesAsConcatenatedString(List<String> fileTypes)
    {
        String tmp = "";
        fileTypes.sort(String::compareTo);
        for (String value : fileTypes)
        {
            tmp += value;
        }
        return tmp;
    }

    public void cleanCache()
    {
        cache.clear();
    }


}
