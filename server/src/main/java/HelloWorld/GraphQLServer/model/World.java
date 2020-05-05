package HelloWorld.GraphQLServer.model;

import org.hibernate.annotations.Generated;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.List;

public class World {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String name;

    private String greeting;

    private List<Human> population;

    public World(String name, String greeting) {
        this.name = name;
        this.greeting = greeting;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGreeting() {
        return greeting;
    }

    public void setGreeting(String greeting) {
        this.greeting = greeting;
    }

    public List<Human> getPopulation() {
        return population;
    }

    public void setPopulation(List<Human> population) {
        this.population = population;
    }
}
