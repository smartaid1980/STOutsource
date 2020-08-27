package com.servtech.servcloud.app.model.after_sales_service;

import com.servtech.servcloud.module.model.Alarm;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_repair")
@IdName("repair_id")
@BelongsToParents({
        @BelongsTo(parent = RepairKind.class,foreignKeyName = "kind_id"),
        @BelongsTo(parent = Customer.class,foreignKeyName = "cus_id"),
        @BelongsTo(parent = Machine.class,foreignKeyName = "machine_id"),
        @BelongsTo(parent = EntityBreakdown.class,foreignKeyName = "breakdown_id"),
        @BelongsTo(parent = Alarm.class,foreignKeyName = "alarm_id")
})
public class Repair extends Model {
}
