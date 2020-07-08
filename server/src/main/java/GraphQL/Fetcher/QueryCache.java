package GraphQL.Fetcher;

import GraphQL.Model.File;
import GraphQL.Model.ResultSet;
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

    private final static int MAX_AMOUNT_OF_FILES_PER_QUERY = 1000;

    private static final ConcurrentHashMap<String, ResultSet> cache = new ConcurrentHashMap<>();

    public QueryCache()
    {
        Executors.newScheduledThreadPool(1).scheduleWithFixedDelay(this::clearCache, 10, 10, TimeUnit.MINUTES);
    }

    public ConcurrentHashMap<String, ResultSet> getCache()
    {
        return cache;
    }

    /**
     * Returns the fitting ResultSet if it is present in cache else returns null
     */
    public synchronized static ResultSet getResultSetIfPresent(String cacheKey, int fromIndex, int toIndex){
        if(isCacheHit(cacheKey, fromIndex, toIndex)){
            ResultSet resultSet = cache.get(cacheKey);
            System.out.println(resultSet.toString());

            return new ResultSet(fromIndex, toIndex, resultSet.getNumberOfTotalFiles(),
                toIndex - fromIndex, resultSet.getFiles().subList(fromIndex - resultSet.getFromIndex(), toIndex - resultSet.getFromIndex()));
        }
        return null;
    }

    public synchronized static boolean putIntoCache(String cacheKey, ArrayList<File> totalFiles, int fromIndex){
        int toIndex = fromIndex + MAX_AMOUNT_OF_FILES_PER_QUERY;
        if(totalFiles.size() <= (fromIndex + toIndex)){
            toIndex = totalFiles.size();
        }

        List<File> subList = totalFiles.subList(fromIndex, toIndex);
        cache.put(cacheKey, new ResultSet(fromIndex, toIndex, totalFiles.size(), toIndex - fromIndex, subList));
        return true;
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

    private static boolean isCacheHit(String cacheKey, int fromIndex, int toIndex){
       if(cache.containsKey(cacheKey)) {
           ResultSet resultSet = cache.get(cacheKey);
           if (resultSet.getFromIndex() <= fromIndex && resultSet.getToIndex() >= toIndex) {
               return true;
           }
       }
        return false;
    }


    private void clearCache()
    {
        cache.clear();
    }
}
