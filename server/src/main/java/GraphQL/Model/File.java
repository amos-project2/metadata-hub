package GraphQL.Model;

import lombok.Data;

import java.util.List;

@Data
public class File
{
    private final String id;
    private final String crawl_id;
    private final String dir_path;
    private final String name;
    private final String type;
    private final String size;
    private final List<Metadatum> metadata;
    private final String creation_time;
    private final String modification_time;
    private final String access_time;
    private final String file_hash;
    private final Boolean deleted;
}
