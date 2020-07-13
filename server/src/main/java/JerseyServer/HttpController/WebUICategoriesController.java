package JerseyServer.HttpController;

import Config.Config;
import QueryServices.FileCategoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.util.List;

@Singleton
@Path("/api/categories/")
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
    public String getAllCategories() throws JsonProcessingException{

        List<String> categories = categoryService.getAllCategories();

        String jsonCategories = new ObjectMapper().writeValueAsString(categories);

        return jsonCategories;
    }
}
