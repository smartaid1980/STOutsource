package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/2 下午 15:02
 */
@Table(value = "m_sys_user")
@IdName(value = "user_id")
@Many2Many(other = SysGroup.class, join = "m_sys_user_group", sourceFKName = "user_id", targetFKName = "group_id")
public class SysUser extends Model {
}
