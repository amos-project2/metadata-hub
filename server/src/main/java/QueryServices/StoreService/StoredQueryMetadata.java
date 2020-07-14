package QueryServices.StoreService;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.sql.Timestamp;

@AllArgsConstructor
public class StoredQueryMetadata
{
    @Getter public final String author;
    @Getter public final Timestamp create_time;
}
