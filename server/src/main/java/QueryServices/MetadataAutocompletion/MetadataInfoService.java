package QueryServices.MetadataAutocompletion;

import Database.Database;
import Database.Model.MetadataInfo;
import com.google.inject.Inject;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
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
public class MetadataInfoService
{
    private final Database database;
    private final ConcurrentHashMap<String, MetadataInfoCache> cache = new ConcurrentHashMap<>();


    @Inject
    public MetadataInfoService(Database database)
    {
        this.database = database;
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(this::cleanCache, 1, 1, TimeUnit.HOURS);
    }


    //it is ok having here so much arguments, because its a request-method -> a refactor to an request-object as input would be possible
    public List<String> requestTagSuggestions(List<String> fileTypes, List<String> usedTags, String searchString, int maxSuggestions, boolean fillToMaxSuggestions)
    {

        String fileTypesID = this.createID(fileTypes);
        MetadataInfoCache metadataInfoCache = getMetadataInfoCache(fileTypes, fileTypesID);


        ArrayList<String> tagSuggestions = new ArrayList<>();
        ArrayList<String> tagSuggestionsBackup = new ArrayList<>();
        AtomicInteger addedSuggestions = new AtomicInteger(0);//TODO replace through a cheaper Integer-Wrapper, cause atomic is here not necessary
        Map<String, MetadataInfo> sortedTagsMap = metadataInfoCache.getTagsSorted();
        sortedTagsMap.forEach((tag, metadataInfo) ->
        {
            if (addedSuggestions.get() >= maxSuggestions) return;
            if (usedTags.contains(tag.toLowerCase())) return;
            if (searchString != null)
            {

                if (!(tag.toLowerCase().contains(searchString.toLowerCase())))
                {
                    tagSuggestionsBackup.add(tag);
                    return;
                }
            }

            addedSuggestions.incrementAndGet();
            tagSuggestions.add(tag);
        });

        if (fillToMaxSuggestions)
        {
            while (tagSuggestions.size() < maxSuggestions)
            {
                if (tagSuggestionsBackup.size() == 0) break;
                tagSuggestions.add(tagSuggestionsBackup.get(0));
                tagSuggestionsBackup.remove(0);
            }
        }

        return tagSuggestions;

    }

    public List<String> requestTagSuggestions(List<String> fileTypes, long limit, long offset)
    {
        String fileTypesID = this.createID(fileTypes);
        MetadataInfoCache metadataInfoCache = getMetadataInfoCache(fileTypes, fileTypesID);
        ArrayList<String> result = new ArrayList<>();

        Map<String, MetadataInfo> sortedTagsMap = metadataInfoCache.getTagsSorted();

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


    public String requestTagDataType(List<String> fileTypes, String metadataTag)
    {

        String tagDatatype;

        String fileTypesID = createID(fileTypes);
        MetadataInfoCache metadataInfoCache = getMetadataInfoCache(fileTypes, fileTypesID);
        Map sortedTags = metadataInfoCache.getTagsSorted();

        if(sortedTags.containsKey(metadataTag)){
           tagDatatype = metadataInfoCache.getTagsSorted().get(metadataTag).getValueDatatype().toString();
        }else{
            tagDatatype = "";
        }

        return tagDatatype;
    }

    @NotNull
    private MetadataInfoCache getMetadataInfoCache(List<String> fileTypes, String fileTypesID)
    {
        MetadataInfoCache metadataInfoCache;//synchronized (this) //not needed i think
        {
            //TODO all-fileTypes
            //fallback for now to jpg
            if (fileTypes.size() == 0)
            {
                metadataInfoCache = cache.computeIfAbsent(fileTypesID, (key) -> { return new MetadataInfoCache("ALL", this.database); });
            }
            else if (fileTypes.size() == 1)
            {
                metadataInfoCache = cache.computeIfAbsent(fileTypesID, (key) -> { return new MetadataInfoCache(fileTypes.get(0), this.database); });
            }
            else
            {
                metadataInfoCache = cache.computeIfAbsent(fileTypesID, (key) -> { return new MetadataInfoCache(fileTypes, cache, database); });
            }
        }
        return metadataInfoCache;
    }

    private String createID(List<String> fileTypes)
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
