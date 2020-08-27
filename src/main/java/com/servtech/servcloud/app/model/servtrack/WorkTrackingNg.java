package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_servtrack_work_tracking_ng")
@CompositePK({ "move_in", "line_id", "work_id", "op", "process_code", "ng_code", "cust_field_1", "cust_field_2", "cust_field_3", "cust_field_4", "cust_field_5"})
@BelongsToParents({
        @BelongsTo(parent = Line.class, foreignKeyName = "line_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "work_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "op"),
        @BelongsTo(parent = ProcessNg.class, foreignKeyName = "ng_code")
})
public class WorkTrackingNg extends Model {
}
