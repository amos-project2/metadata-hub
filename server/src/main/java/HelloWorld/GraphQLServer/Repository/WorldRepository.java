package HelloWorld.GraphQLServer.Repository;

import HelloWorld.GraphQLServer.model.World;
import org.springframework.data.repository.CrudRepository;

public interface WorldRepository extends CrudRepository<World, Long> {
}
