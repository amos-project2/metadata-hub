package Database.Model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;

@AllArgsConstructor
@Getter
public class MetadataInfo implements Comparable<MetadataInfo>
{

    //AttributeName
    private String attribute;

    //Attribute occurrence in the table for a certain file type
    private Integer occurrence;

    //Datatype of the value [str: String or dig: Digit]
    private MetadatumValueDatatype valueDatatype;

    @Override
    public int compareTo(@NotNull MetadataInfo other)
    {
        return this.occurrence.compareTo(other.getOccurrence());
    }

    public MetadataInfo merge(MetadataInfo other)
    {
        this.occurrence += other.getOccurrence(); //merge occurrence

        //TODO merge valueType


        return this;
    }

    public MetadataInfo copy()
    {
        //deep-copy
        return new MetadataInfo(this.attribute, this.occurrence, this.valueDatatype);
    }
}

