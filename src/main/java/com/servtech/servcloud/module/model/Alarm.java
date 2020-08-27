package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2016/5/3.
 */

@Table("m_alarm")
@CompositePK({"alarm_id","cnc_id","machine_type_id"})
@BelongsToParents({
        @BelongsTo(foreignKeyName = "cnc_id", parent = CncBrand.class),
        @BelongsTo(foreignKeyName = "machine_type_id", parent = MachineType.class)
})
public class Alarm extends Model {
    static {
        validatePresenceOf("alarm_id", "cnc_id", "machine_type_id").message("one or more composite PK missing!!!");
    }
}
