package com.servtech.servcloud.app.model.after_sales_service;

import com.servtech.servcloud.module.model.SysUser;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_repair_assign_emp")
@CompositePK({"assign_id","emp_id"})
@BelongsToParents({
        @BelongsTo(parent = RepairAssign.class,foreignKeyName = "assign_id"),
        @BelongsTo(parent = SysUser.class,foreignKeyName = "user_id")
})
public class RepairAssignEmp extends Model {
    static {
        validatePresenceOf("assign_id", "emp_id").message("one or more composite PK missing!!!");
    }
}
