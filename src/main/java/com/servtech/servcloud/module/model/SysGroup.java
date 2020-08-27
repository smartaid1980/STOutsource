package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/9 上午 11:41
 */
@Table("m_sys_group")
@IdName("group_id")
@Many2Many(other = SysUser.class, join = "m_sys_user_group", sourceFKName = "group_id", targetFKName = "user_id")
public class SysGroup extends Model {
}
