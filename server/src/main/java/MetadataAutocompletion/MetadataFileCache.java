package MetadataAutocompletion;

import Database.Database;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class MetadataFileCache
{




    public MetadataFileCache(List<String> fileTypes, ConcurrentHashMap<String, MetadataFileCache> cache)
    {

    }

    public MetadataFileCache(String fileType, Database database)
    {
        try (Connection con = database.gC()) {

            //con.prepareStatement("SELECT * FROM ")


        }
        catch (SQLException throwables)
        {
            throw new RuntimeException(throwables);
        }

    }
}
