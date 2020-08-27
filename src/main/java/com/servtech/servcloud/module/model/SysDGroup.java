package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

@Table("m_sys_d_group")
@IdName("d_group_id")
@Many2Many(other = SysUser.class, join = "m_sys_user_d_group", sourceFKName = "d_group_id", targetFKName = "user_id")
public class SysDGroup extends Model {
}
