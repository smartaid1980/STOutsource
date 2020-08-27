package com.servtech.servcloud.app.model.huangliang_tool;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_tool_price")
@CompositePK({"tool_id", "tsup_id", "create_time"})
@BelongsToParents({
  @BelongsTo(parent = ToolSupplier.class, foreignKeyName = "tsup_id")
})
public class ToolPrice extends Model {
}
