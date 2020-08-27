package com.servtech.servcloud.app.model.after_sales_service;

import com.servtech.servcloud.module.model.Device;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/16.
 */
@Table("a_aftersalesservice_machine")
@IdName("machine_id")
@BelongsToParents({
        @BelongsTo(parent = Device.class,foreignKeyName = "machine_id"),
        @BelongsTo(parent = Customer.class,foreignKeyName = "cus_id"),
        @BelongsTo(parent = CusArea.class,foreignKeyName = "area_id")
})
public class Machine extends Model {
}
