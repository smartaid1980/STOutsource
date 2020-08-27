package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_stock")
@CompositePK({"tool_id", "tsup_id", "buy_time", "tool_location"})
public class ToolStock extends Model {
}
