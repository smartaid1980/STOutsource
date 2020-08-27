package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table(value = "m_sys_user_group")
@CompositePK({ "user_id", "group_id" })
@BelongsToParents({
        @BelongsTo(foreignKeyName = "user_id", parent = SysUser.class),
        @BelongsTo(foreignKeyName = "group_id", parent = SysGroup.class)
})
public class SysUserGroup extends Model {

}