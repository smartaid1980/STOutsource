package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_mp_history")
@CompositePK({"tool_history_no"})
public class ToolMpHistory extends Model {
}
