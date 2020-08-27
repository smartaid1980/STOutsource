package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/9 下午 12:17
 */
@Table("m_sys_auth_func")
@BelongsToParents({
    @BelongsTo(foreignKeyName = "auth_id", parent = SysAuth.class),
    @BelongsTo(foreignKeyName = "func_id", parent = SysFunc.class),
    @BelongsTo(foreignKeyName = "app_id", parent = SysAppInfo.class)
})
public class SysAuthFunc extends Model {
}
