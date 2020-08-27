package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_store_thing_map")
@CompositePK({"store_id", "grid_index", "cell_start_index"})
@BelongsToParents({
        @BelongsTo(parent = Store.class, foreignKeyName = "store_id"),
        @BelongsTo(parent = Thing.class, foreignKeyName = "thing_id"),
})
public class StoreThingMap extends Model {
}
