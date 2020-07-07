package GraphQL.Model;

import lombok.Data;

import java.util.List;

@Data
public class ResultSet {
    private final int numberOfTotalFiles;
    private final int numberOfReturnedFiles;
    private final List<File> files;
}
