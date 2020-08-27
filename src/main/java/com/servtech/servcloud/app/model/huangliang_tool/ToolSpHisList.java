package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_sp_his_list")
@CompositePK({"tool_history_no","tool_id","tool_use_for"})
public class ToolSpHisList extends Model {
}
