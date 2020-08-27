package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/14.
 */
@Table("a_chengshiu_order_shipping")
@IdName("shipping_id")
@BelongsToParents({
        @BelongsTo(parent = SalesOrder.class, foreignKeyName = "order_id"),
        @BelongsTo(parent = Trace.class, foreignKeyName = "trace_id"),
})
public class OrderShipping extends Model {
}
