package QueryServices;

import Database.Database;
import QueryServices.MetadataAutocompletion.MetadataInfoCache;
import com.google.inject.Inject;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class FileCategoryService {

    private final Database database;

    @Inject
    public FileCategoryService(Database database) {
        this.database = database;
    }

    public List<String> getAllCategories(){
       return null;
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
