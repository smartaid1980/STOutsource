package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Raynard on 2017/11/14.
 */
@Table("a_chengshiu_trace_work")
@CompositePK({ "trace_id", "work_id" })
@BelongsToParents({
        @BelongsTo(parent = Trace.class, foreignKeyName = "trace_id"),
        @BelongsTo(parent = WorkOrder.class, foreignKeyName = "work_id")
})
public class TraceWork extends Model {
}
