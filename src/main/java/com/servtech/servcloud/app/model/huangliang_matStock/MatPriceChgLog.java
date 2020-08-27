package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_mat_price_chg_log")
@CompositePK({"mat_id", "sup_id", "create_time"})
@BelongsToParents({
  @BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id"),
  @BelongsTo(parent = MatProfile.class, foreignKeyName = "mat_id")
})
public class MatPriceChgLog extends Model {
}
