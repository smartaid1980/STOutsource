package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_stock_chg")
@CompositePK({"chg_time"})
@BelongsToParents({
  @BelongsTo(parent = ToolStock.class, foreignKeyName = "tsup_id"),
  @BelongsTo(parent = ToolStock.class, foreignKeyName = "tool_id"),
  @BelongsTo(parent = ToolStock.class, foreignKeyName = "tool_location"),
  @BelongsTo(parent = ToolStock.class, foreignKeyName = "buy_time"),
  @BelongsTo(parent = ToolLocation.class, foreignKeyName = "new_location"),
})
public class ToolStockChg extends Model {
}
