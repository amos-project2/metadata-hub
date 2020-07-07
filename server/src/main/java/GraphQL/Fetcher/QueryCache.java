package GraphQL.Fetcher;

import GraphQL.Model.File;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class QueryCache {

    private static final ConcurrentHashMap<String, ArrayList<File>> cache = new ConcurrentHashMap<>();
    private static final QueryCache queryCache = new QueryCache();
    private static final Boolean activatedCacheClearing = queryCache.activateCacheClearing();

    private QueryCache() {
    }

    public static ConcurrentHashMap<String, ArrayList<File>> getCache(){
        return cache;
    }

    private Boolean activateCacheClearing(){
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(queryCache::clearCache, 10, 10, TimeUnit.MINUTES);
        return true;
    }

    private void clearCache(){
        cache.clear();
    }
}
