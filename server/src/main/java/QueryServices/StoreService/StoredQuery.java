package QueryServices.StoreService;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class StoredQuery
{
    @Getter public final StoredQueryMetadata metadata;
    @Getter public final String data;
}
