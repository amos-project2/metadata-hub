package GraphQL.Fetcher;

import GraphQL.Model.File;
import com.google.inject.Singleton;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Singleton
public class QueryCache
{

    private final ConcurrentHashMap<String, ArrayList<File>> cache = new ConcurrentHashMap<>();
//    private static final QueryCache queryCache = new QueryCache();
//    private static final Boolean activatedCacheClearing = queryCache.activateCacheClearing();

    public QueryCache()
    {
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(this::clearCache, 10, 10, TimeUnit.MINUTES);
    }

    public ConcurrentHashMap<String, ArrayList<File>> getCache()
    {
        return cache;
    }

    public static String createCashKey(String sqlQuery, List<String> selected_attributes)
    {
        String key = sqlQuery;

        if (selected_attributes != null)
        {
            Collections.sort(selected_attributes);


            for (String attribute : selected_attributes)
            {
                key += attribute;
            }
        }
        return key;
    }


    private void clearCache()
    {
        cache.clear();
    }
}
