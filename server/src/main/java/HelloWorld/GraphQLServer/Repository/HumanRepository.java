package HelloWorld.GraphQLServer.Repository;

import HelloWorld.GraphQLServer.model.Human;
import org.springframework.data.repository.CrudRepository;

public interface HumanRepository extends CrudRepository<Human, Long> {
}
