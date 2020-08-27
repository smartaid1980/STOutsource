package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_sp_list")
@CompositePK({"tool_use_no","buy_time","tool_id","tsup_id","tool_location","tool_use_for"})
public class ToolSpList extends Model {
}
