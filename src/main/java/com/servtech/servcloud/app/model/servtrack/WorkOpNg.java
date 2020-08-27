package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_servtrack_work_op_ng")
@CompositePK({ "work_id", "op", "ng_code" })
@BelongsToParents({
        @BelongsTo(parent = Work.class, foreignKeyName = "work_id"),
        @BelongsTo(parent = WorkOp.class, foreignKeyName = "op"),
        @BelongsTo(parent = ProcessNg.class, foreignKeyName = "ng_code")
})
public class WorkOpNg extends Model {
}
