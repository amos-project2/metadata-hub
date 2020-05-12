package Model;

import lombok.Data;

@Data
public class Tree_Walk
{
    private final String id;
    private final String name;
    private final String notes;
    private final String root_path;
    private final String start_time;
    private final String end_time;
    private final String status;
    private final String crawl_config;
    private final String update_time;
    private final Boolean save_in_generic_table;
}
