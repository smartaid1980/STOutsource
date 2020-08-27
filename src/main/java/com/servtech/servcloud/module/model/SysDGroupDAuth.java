package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.Table;

@Table(value = "m_sys_d_group_d_auth")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "d_group_id", parent = SysDGroup.class),
        @BelongsTo(foreignKeyName = "d_auth_id", parent = SysDAuth.class)
})
public class SysDGroupDAuth extends Model {
}
