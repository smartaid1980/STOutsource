package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Beata on 2018/3/17.
 */
@Table(value = "m_sys_group_auth")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "group_id", parent = SysGroup.class),
        @BelongsTo(foreignKeyName = "auth_id", parent = SysAuth.class)
})
public class SysGroupAuth extends Model {

}
