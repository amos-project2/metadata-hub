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

    public static int getMaxLimit(){
        return MAX_AMOUNT_OF_FILES_PER_QUERY;
    }

    /**
     * Returns the fitting ResultSet if it is present in cache else returns null
     */
    public synchronized static ResultSet getResultSetIfPresent(String cacheKey, int fromIndex, int toIndex){
        if(isCacheHit(cacheKey, fromIndex, toIndex)){
            ResultSet resultSet = cache.get(cacheKey);

            //no limit is used and from offset on the resultSet is totally in the cache
            if(fromIndex == toIndex){
                toIndex = resultSet.getToIndex();
            }
            int relativeFromIndex = fromIndex - resultSet.getFromIndex();
            int relativeToIndex = toIndex - resultSet.getFromIndex();

            return new ResultSet(fromIndex, toIndex, resultSet.getNumberOfTotalFiles(),
                toIndex - fromIndex, resultSet.getFiles().subList(relativeFromIndex, relativeToIndex));
        }
        return null;
    }

    public synchronized static boolean putIntoCache(String cacheKey, ArrayList<File> cacheFiles, int totalNumberOfFiles, int fromIndex){
        //Only cache up to MAX_AMOUNT_OF_FILES_PER_QUERY
        int relativeToIndex = MAX_AMOUNT_OF_FILES_PER_QUERY;
        if(cacheFiles.size() < MAX_AMOUNT_OF_FILES_PER_QUERY){
            relativeToIndex = cacheFiles.size();
        }

        List<File> subList = cacheFiles.subList(0, relativeToIndex);
        int absoluteToIndex = fromIndex + relativeToIndex;
        cache.put(cacheKey, new ResultSet(fromIndex, absoluteToIndex, totalNumberOfFiles, subList.size(), subList));
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
           //toIndex == fromIndex singals that no limit was used,
           // so if the whole resultSet isn't in the cache the database has to be queried
           if(toIndex == fromIndex && resultSet.getNumberOfTotalFiles() != resultSet.getToIndex()){
               return false;
           }
           if (resultSet.getFromIndex() <= fromIndex && resultSet.getToIndex() >= toIndex) {
               return true;
           }
       }
        return false;
    }


    public void clearCache()
    {
        cache.clear();
    }
}
