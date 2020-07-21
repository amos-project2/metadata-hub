package QueryServices.MetadataAutocompletion;

import Database.Database;
import Database.DatabaseException;
import com.google.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service-Class
 */
public class FileTypeAutocompletionService
{
    private final Database database;
    private final ConcurrentHashMap<String, MetadataInfoCache> cache = new ConcurrentHashMap<>();


    @Inject
    public FileTypeAutocompletionService(Database database)
    {
        this.database = database;

    }

    /**
     * The List excludeFileTypes must contain lower-cased-elements
     */
    public List<String> getFileTypes(List<String> excludeFileTypes, String search, int count) throws SQLException, DatabaseException {

        //exclude our ALL-type from the file-type-suggestions
        excludeFileTypes.add("all");

        ArrayList<String> ret = new ArrayList<String>();
        String file_type;

        try (Connection con = database.gC())
        {
            PreparedStatement preparedStatement = con.prepareStatement("SELECT file_type FROM public.metadata WHERE file_type ILIKE ?");
            preparedStatement.setString(1, "%" + search + "%");
            ResultSet resultSet = preparedStatement.executeQuery();


            int counter = 0;
            while (resultSet.next())
            {
                if (counter > count) break;

                file_type = resultSet.getString("file_type");
                if (excludeFileTypes.contains(file_type.toLowerCase())) continue;

                counter++;
                ret.add(file_type);
            }
        }
        return ret;


    }

    public List<String> getAllFileTypes() throws SQLException, DatabaseException {
        return this.getFileTypes(-1, 0);
    }

    /**
     * Limit -1 -> ALL
     */
    public List<String> getFileTypes(long limit, long offset) throws SQLException, DatabaseException {
        ArrayList<String> ret = new ArrayList<String>();
        try (Connection con = database.gC())
        {
            PreparedStatement preparedStatement;
            if (limit == -1)
            {
                preparedStatement = con.prepareStatement("SELECT file_type FROM public.metadata WHERE true offset ?;");
                preparedStatement.setLong(1, offset);
            }
            else
            {
                preparedStatement = con.prepareStatement("SELECT file_type FROM public.metadata WHERE true offset ? limit ?;");
                preparedStatement.setLong(1, offset);
                preparedStatement.setLong(2, limit);
            }

            ResultSet resultSet = preparedStatement.executeQuery();

            while (resultSet.next())
            {
                ret.add(resultSet.getString("file_type"));
            }
        }
        return ret;
    }


}
