package GraphQL.Model;

import lombok.Data;

@Data
public class Crawl
{
    private final String id;
    private final String dir_path;
    private final String name;
    private final String status;
    private final String crawl_config;
    private final String analyzed_dirs;
    private final String starting_time;
    private final String finished_time;
    private final String update_time;
    private final String analyzed_dirs_hash;
}
