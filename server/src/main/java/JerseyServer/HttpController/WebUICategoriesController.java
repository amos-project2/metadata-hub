package JerseyServer.HttpController;

import Config.Config;
import Database.DatabaseException;
import QueryServices.FileCategoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.*;
import java.sql.SQLException;
import java.util.List;

@Singleton
@Path("/api/categoryService/")
public class WebUICategoriesController {


    private final Config config;
    private final FileCategoryService categoryService;

    @Inject
    public WebUICategoriesController(Config config, FileCategoryService categoryService)
    {
        this.config = config;
        this.categoryService = categoryService;
    }

    @GET
    @Produces("application/json")
    @Path("/")
    public String getAllCategories() throws JsonProcessingException, DatabaseException, SQLException {

        List<String> categories = categoryService.getAllCategories();

        String jsonCategories = new ObjectMapper().writeValueAsString(categories);

        return jsonCategories;
    }

    @GET
    @Produces("application/json")
    @Path("/")
    public String getFileTypesOfCategory(@QueryParam("category") String category) throws JsonProcessingException{

        List<String> fileTypes = categoryService.getFileTypesOfCategory(category);

        String jsonCategories = new ObjectMapper().writeValueAsString(fileTypes);

        return jsonCategories;
    }


    @POST
    @Path("/admin/")
    public void createCategory(@QueryParam("category") String category,
                                     @QueryParam("file_types") List<String> file_types){
        categoryService.createCategory(category, file_types);
    }

    @DELETE
    @Path("/admin/")
    public void deleteCategory(@QueryParam("category") String category){
        categoryService.deleteCategory(category);
    }

    @PUT
    @Path("/admin/")
    public void renameCategory(@QueryParam("oldName") String oldName, @QueryParam("newName") String newName){
        categoryService.renameCategory(oldName, newName);
    }

    @PUT
    @Path("/admin/")
    public void addTypeToCategory(@QueryParam("category") String category, @QueryParam("file_type") String file_type){
        categoryService.addTypeToCategory(category, file_type);
    }

    @DELETE
    @Path("/admin/")
    public void deleteTypeFromCategory(@QueryParam("category") String category, @QueryParam("file_type") String file_type){
        categoryService.deleteTypeFromCategory(category, file_type);
    }
}
