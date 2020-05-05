package HelloWorld.GraphQLServer.Resolver;

import HelloWorld.GraphQLServer.Repository.HumanRepository;
import HelloWorld.GraphQLServer.Repository.WorldRepository;
import HelloWorld.GraphQLServer.model.Human;
import HelloWorld.GraphQLServer.model.World;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class Query implements GraphQLResolver {

    private WorldRepository worldRepository;
    private HumanRepository humanRepository;

    public Query(WorldRepository worldRepository, HumanRepository humanRepository){
        this.worldRepository = worldRepository;
        this.humanRepository = humanRepository;
    }

    public Optional<World> world(Long id){
       return worldRepository.findById(id);
    }

    public Optional<Human> human(Long id){return humanRepository.findById(id);}

    public String knockknock(){
        return "Hello";
    }
}
