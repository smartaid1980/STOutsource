package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table(value = "m_sys_user_d_group")
@CompositePK({ "user_id", "D_group_id" })
@BelongsToParents({
        @BelongsTo(foreignKeyName = "user_id", parent = SysUser.class),
        @BelongsTo(foreignKeyName = "d_group_id", parent = SysDGroup.class)
})
public class SysUserDGroup extends Model {
}
