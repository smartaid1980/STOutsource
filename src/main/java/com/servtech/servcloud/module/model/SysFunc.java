package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/9 上午 11:42
 */
@Table("m_sys_func")
@IdName("func_id")
@BelongsTo(parent = SysAppInfo.class, foreignKeyName = "app_id")
@Many2Many(other = SysAuth.class, join = "m_sys_auth_func", sourceFKName = "func_id", targetFKName = "auth_id")
public class SysFunc extends Model {
}
