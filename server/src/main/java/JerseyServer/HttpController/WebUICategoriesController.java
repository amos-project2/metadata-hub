package JerseyServer.HttpController;

import Config.Config;
import Database.DatabaseException;
import QueryServices.FileCategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Singleton
@Path("/api/categoryService/")
public class WebUICategoriesController {


    private static final Logger log = LoggerFactory.getLogger(WebUICategoriesController.class);

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
    public String getAllCategories() throws IOException, DatabaseException, SQLException {

        Map<String, List<String>> categories = categoryService.getAllCategories();

        String jsonCategories = new ObjectMapper().writeValueAsString(categories);

        log.info("getAllCategories: " + jsonCategories);
        return jsonCategories;
    }

    @POST
    @Path("/admin/{category}")
    public boolean createCategory(@PathParam("category") String category,
                                     @QueryParam("file_types") String file_types) throws DatabaseException, SQLException {

        log.info("CreateCategory: " + category + " + " + file_types);
        List<String> fileTypesList = createList(file_types);
        categoryService.createCategory(category, fileTypesList);
        return true;
    }

    @POST
    @Path("/admin/{category}/update")
    public boolean updateCategory(@PathParam("category") String category,
                                  @QueryParam("file_types") String file_types) throws DatabaseException, SQLException {

        log.info("UpdateCategory: " + category + " + " + file_types);
        List<String> fileTypesList = createList(file_types);
        categoryService.deleteCategory(category);
        categoryService.createCategory(category, fileTypesList);
        return true;
    }

    @DELETE
    @Path("/admin/{category}")
    public boolean deleteCategory(@PathParam("category") String category) throws DatabaseException, SQLException {
        categoryService.deleteCategory(category);
        log.info("DeleteCategory: " + category);
        return true;
    }

    @PUT
    @Path("/admin/")
    public boolean renameCategory(@QueryParam("oldName") String oldName, @QueryParam("newName") String newName) throws DatabaseException, SQLException {
        categoryService.renameCategory(oldName, newName);
        log.info("RenameCategory: " + oldName + " to " + newName);
        return true;
    }

    @PUT
    @Path("/admin/{category}/{file_types}")
    public boolean addTypesToCategory(@PathParam("category") String category, @PathParam("file_types") String file_types) throws DatabaseException, SQLException {
        log.info("addTypesToCategory: category= " + category + " file_types= " + file_types);
        List<String> fileTypesList = createList(file_types);
        categoryService.addTypesToCategory(category, fileTypesList);
        return true;
    }

    @DELETE
    @Path("/admin/{category}/{file_type}")
    public boolean deleteTypeFromCategory(@PathParam("category") String category, @PathParam("file_type") String file_type) throws DatabaseException, SQLException {
        log.info("deleteTypeFromCategory: category= " + category + " file_type= " + file_type);
        categoryService.deleteTypeFromCategory(category, file_type);
        return true;
    }

    private List<String> createList(String data)
    {
        return createList(data, false);
    }

    private List<String> createList(String data, boolean bigX)
    {
        String x = "x";
        if (bigX) x = "X";
        return (data.equals("")) ? new ArrayList<>() : Arrays.asList(data.split("\\$" + x + "\\$"));
    }
}
