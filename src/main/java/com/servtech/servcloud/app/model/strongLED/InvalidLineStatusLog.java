package com.servtech.servcloud.app.model.strongLED;

import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_strongled_invalid_line_status_log")
@CompositePK({ "move_in", "line_id", "work_id", "op", "cust_field_1", "cust_field_2", "cust_field_3", "cust_field_4", "cust_field_5", "line_status_start"})
@BelongsToParents({
        @BelongsTo(parent = Line.class, foreignKeyName = "line_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "work_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "op")
})
public class InvalidLineStatusLog extends Model {
}
