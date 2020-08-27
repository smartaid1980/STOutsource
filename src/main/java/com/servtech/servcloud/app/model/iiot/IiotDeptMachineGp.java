package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_dept_machine_gp")
@CompositePK({ "group_id", "dept_id" })
@BelongsToParents({
        @BelongsTo(parent = IiotDept.class, foreignKeyName = "dept_id")
})
public class IiotDeptMachineGp extends Model {
}
