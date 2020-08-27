package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;


/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_tracking_chg")
@CompositePK({ "move_in", "machine_name", "nc_name", "tool_prep_id", "tool_no" })
@BelongsToParents({
        @BelongsTo(parent = IiotToolPrep.class, foreignKeyName = "tool_prep_id"),
        @BelongsTo(parent = IiotToolNcList.class, foreignKeyName = "nc_name"),
        @BelongsTo(parent = IiotToolNcList.class, foreignKeyName = "tool_no"),
        @BelongsTo(parent = IiotTool.class, foreignKeyName = "tool_id"),
        @BelongsTo(parent = IiotToolHolderList.class, foreignKeyName = "holder_id")
})
public class IiotToolTrackingChg extends Model {
}
