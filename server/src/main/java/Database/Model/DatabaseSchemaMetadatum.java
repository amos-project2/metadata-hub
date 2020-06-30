package Database.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;

@AllArgsConstructor
@Getter
public class DatabaseSchemaMetadatum implements Comparable<DatabaseSchemaMetadatum>{
    //AttributeName
    String attribute;
    //Attribute occurrence in the table for a certain file type
    Integer occurrence;
    //Datatype of the value [str: String or dig: Digit]
    MetadatumValueDatatype valueDatatype;

    @Override
    public int compareTo(@NotNull DatabaseSchemaMetadatum other) {
        return this.occurrence.compareTo(other.getOccurrence());
    }
}

