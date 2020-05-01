import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

//all tests must be in tests/java/*
//all tests must have in their class name the Name tests
//no more configuration is needed: maven do the rest^^

public class ExampleTest
{
    //here you can use more junit annotations, like @Before and so on

    @Test
    public void test1()
    {
        assertEquals("hey", "hey");
    }
}
