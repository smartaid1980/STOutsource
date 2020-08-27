package com.servtech.servcloud.app.model.comoss;

import com.servtech.servcloud.app.model.storage.Store;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("a_storage_store_schedule_thing_map")
@IdName("schedule_thing_id")
@BelongsToParents({
        @BelongsTo(parent = Store.class, foreignKeyName = "store_id"),
        @BelongsTo(parent = ScheduleThing.class, foreignKeyName = "schedule_thing_id"),
})
public class StoreScheduleThingMap extends Model {
}
