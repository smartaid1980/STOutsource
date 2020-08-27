package com.servtech.servcloud.app.model.after_sales_service;

import com.servtech.servcloud.module.model.SysUser;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/18.
 */

@Table("a_aftersalesservice_entity_emp")
@CompositePK({"entity_id","user_id"})
@BelongsToParents({
        @BelongsTo(parent = Entity.class,foreignKeyName = "entity_id"),
        @BelongsTo(parent = SysUser.class,foreignKeyName = "user_id")
})
public class EntityEmp extends Model {
}
