package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_servtrack_work_op")
@CompositePK({ "work_id", "op" })
@BelongsToParents({
        @BelongsTo(parent = Work.class, foreignKeyName = "work_id"),
        @BelongsTo(parent = Process.class, foreignKeyName = "process_code")
})
public class WorkOp extends Model {
}
