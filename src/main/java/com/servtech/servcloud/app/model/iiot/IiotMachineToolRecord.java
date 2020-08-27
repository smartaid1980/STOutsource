package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_machine_tool_record")
@CompositePK({ "machine_name", "work_date", "nc_name", "tool_no" })
@BelongsToParents({
        @BelongsTo(parent = IiotToolNcList.class, foreignKeyName = "nc_name"),
        @BelongsTo(parent = IiotToolNcList.class, foreignKeyName = "tool_no")
})
public class IiotMachineToolRecord extends Model {
}
