package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny
 * Datetime: 2016/7/18 上午 09:52
 */
@Table("m_sys_group_machine")
@BelongsToParents({
    @BelongsTo(foreignKeyName = "group_id", parent = SysGroup.class),
    @BelongsTo(foreignKeyName = "machine_id", parent = Device.class)
})
public class SysGroupMachine extends Model {
}
