package GraphQL.Model;

import lombok.Data;

@Data
public class Error {
    private final String message;
    private final String stack_trace;
}
