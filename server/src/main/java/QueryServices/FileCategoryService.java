package QueryServices;

import Database.Database;
import Database.Model.DatabaseSchemaDefinition;
import QueryServices.MetadataAutocompletion.MetadataInfoCache;
import com.google.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import Database.DatabaseException;

public class FileCategoryService {

    private final Database database;

    @Inject
    public FileCategoryService(Database database) {
        this.database = database;
    }

    public List<String> getAllCategories() throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("SELECT file_category FROM file_categories");
            ResultSet resultSet = statement.executeQuery();

            List<String> categories = new ArrayList<>();
            while (resultSet.next()){
                categories.add(resultSet.getString(DatabaseSchemaDefinition.FILE_CATEGORIES_FILE_CATEGORY));
            }

            return categories;
        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    public List<String> getFileTypesOfCategory(String category){
        return null;
    }

    public void createCategory(String category, List<String> fileTypes){

    }

    public void deleteCategory(String category){

    }

    public void renameCategory(String oldName, String newName){
    }

    public void addTypeToCategory(String category, String type){

    }

    public void deleteTypeFromCategory(String category, String type){

    }



}
