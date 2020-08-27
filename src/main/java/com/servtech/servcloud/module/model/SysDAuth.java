package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

@Table("m_sys_d_auth")
@IdName("d_auth_id")
@Many2Many(other = SysDGroup.class, join = "m_sys_d_group_d_auth", sourceFKName = "d_auth_id", targetFKName = "d_group_id")
public class SysDAuth extends Model {
}
