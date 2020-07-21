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
        return other.getOccurrence().compareTo(this.getOccurrence());
    }

    @Override
    public String toString() {
       return "MetaInfo| Attribute: " + attribute + " Occurrence: " + occurrence.toString();
    }

    public MetadataInfo merge(MetadataInfo other)
    {
        this.occurrence += other.getOccurrence();

        //Never happened but maybe the ExifTool returns differing data types for a Tag, then the default data type is String
        if(this.valueDatatype != other.valueDatatype){
            this.valueDatatype = MetadatumValueDatatype.str;
        }

        return this;
    }

    public MetadataInfo copy()
    {
        //deep-copy
        return new MetadataInfo(this.attribute, this.occurrence, this.valueDatatype);
    }
}

