package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_tracking_no_tool")
@CompositePK({ "move_in", "machine_id", "nc_name", "tool_no"})
public class IiotToolTrackingNoTool extends Model {
}
