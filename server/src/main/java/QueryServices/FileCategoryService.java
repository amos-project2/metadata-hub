package QueryServices;

import Database.Database;
import Database.Model.DatabaseSchemaDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import Database.DatabaseException;

public class FileCategoryService {

    private final Database database;

    @Inject
    public FileCategoryService(Database database) {
        this.database = database;
    }

    public Map<String, List<String>> getAllCategories() throws DatabaseException, SQLException, IOException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("SELECT * FROM file_categories");
            ResultSet resultSet = statement.executeQuery();

            Map<String, List<String>> categories = new HashMap<>();
            while (resultSet.next()){

                String fileTypesString = resultSet.getString(DatabaseSchemaDefinition.FILE_CATEGORIES_FILE_TYPES);
                List<String> fileTypesList = new ObjectMapper().readValue(fileTypesString, List.class);
                categories.put(resultSet.getString(DatabaseSchemaDefinition.FILE_CATEGORIES_FILE_CATEGORY), fileTypesList);
            }

            return categories;
        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    public void createCategory(String category, List<String> fileTypes) throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("INSERT INTO file_categories VALUES (?, to_jsonb(?::json))");

            statement.setString(1, category);
            String fileTypesString = fileTypes.stream()
                .map(fileType -> "\""+ fileType +"\"")
                .collect(Collectors.joining(",","[","]"));
            statement.setString(2, fileTypesString);
            statement.executeUpdate();

        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }

    }

    public void deleteCategory(String category) throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("DELETE FROM file_categories WHERE file_category = ?");
            statement.setString(1, category);
            statement.executeUpdate();

        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    public void renameCategory(String oldName, String newName) throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("UPDATE file_categories SET file_category = ? WHERE file_category = ?");
            statement.setString(1, newName);
            statement.setString(2, oldName);
            statement.executeUpdate();

        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    public void addTypeToCategory(String category, String type){

    }

    public void deleteTypeFromCategory(String category, String type){

    }



}
