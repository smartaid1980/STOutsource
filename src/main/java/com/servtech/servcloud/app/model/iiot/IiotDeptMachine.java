package com.servtech.servcloud.app.model.iiot;

import com.servtech.servcloud.module.model.Device;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_dept_machine")
@CompositePK({ "machine_id"})
@BelongsToParents({
        @BelongsTo(parent = IiotDept.class, foreignKeyName = "dept_id"),
        @BelongsTo(parent = IiotDeptMachineGp.class, foreignKeyName = "group_id"),
        @BelongsTo(parent = Device.class, foreignKeyName = "machine_id")
})
public class IiotDeptMachine extends Model {
}
