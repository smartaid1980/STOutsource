package com.servtech.servcloud.app.model.kuochuan_servtrack;

import com.servtech.servcloud.app.model.servtrack.WorkOp;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/25.
 */
@Table("a_kuochuan_servtrack_work_op")
@CompositePK({ "work_id", "op"})
@BelongsToParents({
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "work_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "op")
})
public class KcWorkOp extends Model {
}
