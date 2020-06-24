package MetadataAutocompletion;

import Database.Database;
import com.google.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class MetadataAutocompletion
{
    private final Database database;
    private final ConcurrentHashMap<String, MetadataFileCache> cache = new ConcurrentHashMap<>();


    @Inject
    public MetadataAutocompletion(Database database)
    {
        this.database = database;
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(this::cleanCache,1,1, TimeUnit.HOURS);
    }


    public List<String> request(List<String> fileTypes, List<String> usedSearch, String search, int count)
    {

        String fileTypesAsString = this.getFileTypesAsConcatenatedString(fileTypes);
        MetadataFileCache metadataFileCache;


        //synchronized (this) //not needed i think
        {
            //TODO all-fileTypes
            //fallback for now to jpg
            if (fileTypes.size() == 0)
            {
                metadataFileCache = cache.computeIfAbsent(fileTypesAsString, (key) ->
                {
                    return new MetadataFileCache("JPG", this.database);
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

        ArrayList<String> result = new ArrayList<>();
        ArrayList<String> resultBackup = new ArrayList<>();
        AtomicInteger counter = new AtomicInteger(0);//TODO replace through a cheaper Integer-Wrapper, cause atomic is here not necessary
        metadataFileCache.tagsSorted.forEach((key, value) ->
        {
            if (counter.get() >= count) return;
            if (usedSearch.contains(key.toLowerCase())) return;
            if (!(key.toLowerCase().contains(search.toLowerCase())))
            {
                resultBackup.add(key);
                return;
            }

            counter.incrementAndGet();
            result.add(key);
        });

        while (result.size() < count)
        {
            if (resultBackup.size() == 0) break;
            result.add(resultBackup.get(0));
            resultBackup.remove(0);
        }


        return result;

    }

    private String getFileTypesAsConcatenatedString(List<String> fileTypes)
    {
        String tmp = "";
        for (String value : fileTypes)
        {
            tmp += value;
        }
        return tmp;
    }

    private void cleanCache()
    {
        cache.clear();
    }



}
