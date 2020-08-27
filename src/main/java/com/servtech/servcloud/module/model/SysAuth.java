package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/9 上午 11:39
 */
@Table("m_sys_auth")
@IdName("auth_id")
@Many2Many(other = SysGroup.class, join = "m_sys_group_auth", sourceFKName = "auth_id", targetFKName = "group_id")
public class SysAuth extends Model {
}
