package GraphQL.Model;

import lombok.Data;

import java.util.List;

@Data
public class ResultSet {

    private int fromIndex;
    private int toIndex;
    private int numberOfTotalFiles;
    private int numberOfReturnedFiles;
    private List<File> files;
    private Error error;

    public ResultSet(int fromIndex, int toIndex, int numberOfTotalFiles, int numberOfReturnedFiles, List<File> files) {
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
        this.numberOfTotalFiles = numberOfTotalFiles;
        this.numberOfReturnedFiles = numberOfReturnedFiles;
        this.files = files;
    }

    public ResultSet(Error error) {
        this.error = error;
    }
}
