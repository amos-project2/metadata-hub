package Database.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;

@AllArgsConstructor
@Getter
public class DatabaseSchemaMetadatum implements Comparable<DatabaseSchemaMetadatum>
{

    //AttributeName
    private String attribute;

    //Attribute occurrence in the table for a certain file type
    private Integer occurrence;

    //Datatype of the value [str: String or dig: Digit]
    private MetadatumValueDatatype valueDatatype;

    @Override
    public int compareTo(@NotNull DatabaseSchemaMetadatum other)
    {
        return this.occurrence.compareTo(other.getOccurrence());
    }

    public DatabaseSchemaMetadatum merge(DatabaseSchemaMetadatum other)
    {
        this.occurrence += other.getOccurrence(); //merge occurrence

        //TODO merge valueType


        return this;
    }
}

