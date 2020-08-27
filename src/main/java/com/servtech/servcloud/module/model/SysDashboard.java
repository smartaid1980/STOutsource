package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

@Table("m_sys_dashboard")
@IdName("dashboard_id")
@BelongsTo(parent = SysAppInfo.class, foreignKeyName = "app_id")
@Many2Many(other = SysAuth.class, join = "m_sys_auth_dashboard", sourceFKName = "dashboard_id", targetFKName = "auth_id")
public class SysDashboard extends Model {
}
