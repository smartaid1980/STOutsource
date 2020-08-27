package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.Table;

@Table("m_sys_d_auth_dashboard")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "d_auth_id", parent = SysDAuth.class),
        @BelongsTo(foreignKeyName = "dashboard_id", parent = SysDashboard.class),
        @BelongsTo(foreignKeyName = "app_id", parent = SysAppInfo.class)
})
public class SysDAuthDashboard extends Model {
}
