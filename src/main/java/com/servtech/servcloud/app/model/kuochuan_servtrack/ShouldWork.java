package com.servtech.servcloud.app.model.kuochuan_servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/25.
 */
@Table("a_kuochuan_servtrack_should_work")
@CompositePK({ "staff_id", "shift_day"})
@BelongsToParents({
        @BelongsTo(parent = Staff.class, foreignKeyName = "staff_id")
})
public class ShouldWork extends Model {
}
