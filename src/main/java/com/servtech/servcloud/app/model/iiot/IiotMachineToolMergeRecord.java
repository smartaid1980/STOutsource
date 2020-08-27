package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_machine_tool_merge_record")
@CompositePK({ "machine_id", "work_date", "nc_name", "tool_no", "work_start_time, holder_id, dept_id, tool_id"})
public class IiotMachineToolMergeRecord extends Model {
}
