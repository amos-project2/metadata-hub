package MetadataAutocompletion;

import Database.Database;
import com.google.inject.Inject;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class MetadataAutocompletion
{
    private final Database database;
    private final ConcurrentHashMap<String, MetadataFileCache> cache=new ConcurrentHashMap<>();


    @Inject
    public MetadataAutocompletion(Database database)
    {
        this.database = database;
    }

    public void request(List<String> fileTypes, List<String> usedSearch, String search)
    {
        String fileTypesAsString = this.getFileTypesAsConcatenatedString(fileTypes);
        MetadataFileCache metadataFileCache;

        //TODO all-fileTypes
        //fallback for now to jpg
        if(fileTypes.size()==0)
        {
            metadataFileCache = cache.computeIfAbsent(fileTypesAsString, (key) ->
            {
                return new MetadataFileCache("jpg", this.database);
            });
        }
        if(fileTypes.size()==1)
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
                return new MetadataFileCache(fileTypes, cache);
            });
        }


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


}
