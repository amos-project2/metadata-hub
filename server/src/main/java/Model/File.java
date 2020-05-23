package Model;

import lombok.Data;

import java.util.List;

@Data
public class File
{
    private final String id;
    private final String tree_walk_id;
    private final String sub_path;
    private final String name;
    private final String file_type;
    private final String creation_date;
    private final String modification_date;
    private final String access_date;
    private final String metadataJson;
    private final List<Metadatum> metadata;
}
