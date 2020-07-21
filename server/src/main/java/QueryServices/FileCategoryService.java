package QueryServices;

import Database.Database;
import Database.DatabaseException;
import Database.Model.DatabaseSchemaDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
            PreparedStatement statement = connection.prepareStatement("INSERT INTO file_categories VALUES (?, ?::jsonb)");

            statement.setString(1, category);
            String fileTypesJsonString = createJsonString(fileTypes);
            statement.setString(2, fileTypesJsonString);
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

    public void addTypesToCategory(String category, List<String> file_types) throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("UPDATE file_categories SET file_types = COALESCE(file_types, '[]'::jsonb) || ?::jsonb WHERE file_category = ?");

            String fileTypesJsonString = createJsonString(file_types);
            statement.setString(1, fileTypesJsonString);
            statement.setString(2, category);
            statement.executeUpdate();

        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    public void deleteTypeFromCategory(String category, String file_type) throws DatabaseException, SQLException {

        try(Connection connection = database.getJDBCConnection()){
            PreparedStatement statement = connection.prepareStatement("UPDATE file_categories SET file_types = file_types - ? WHERE file_category = ?");

            statement.setString(1, file_type);
            statement.setString(2, category);
            statement.executeUpdate();

        } catch (DatabaseException|SQLException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    @NotNull
    private String createJsonString(List<String> fileTypes) {
        return fileTypes.stream()
            .map(fileType -> "\""+ fileType +"\"")
            .collect(Collectors.joining(",","[","]"));
    }
}
