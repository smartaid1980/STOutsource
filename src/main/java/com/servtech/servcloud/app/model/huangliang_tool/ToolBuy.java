package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_buy")
@CompositePK({"tool_id", "tsup_id", "buy_time"})
@BelongsToParents({
  @BelongsTo(parent = ToolSupplier.class, foreignKeyName = "tsup_id"),
  @BelongsTo(parent = ToolProfile.class, foreignKeyName = "tool_id")
})
public class ToolBuy extends Model {
}
