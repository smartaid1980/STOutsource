package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_prep_list")
@CompositePK({ "tool_prep_id", "nc_name", "tool_no" })
@BelongsToParents({
        @BelongsTo(parent = IiotToolNc.class, foreignKeyName = "nc_name"),
        @BelongsTo(parent = IiotToolErpSync.class, foreignKeyName = "tool_code"),
        @BelongsTo(parent = IiotTool.class, foreignKeyName = "tool_id"),
        @BelongsTo(parent = IiotToolHolderList.class, foreignKeyName = "holder_id")
})
public class IiotToolPrepList extends Model {
}
