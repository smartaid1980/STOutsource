package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/14.
 */
@Table("a_chengshiu_trace_material")
@CompositePK({ "trace_id", "item_id" })
@BelongsToParents({
        @BelongsTo(parent = MaterialItem.class, foreignKeyName = "item_id"),
        @BelongsTo(parent = Trace.class, foreignKeyName = "trace_id")
})
public class TraceMaterial extends Model {
}
