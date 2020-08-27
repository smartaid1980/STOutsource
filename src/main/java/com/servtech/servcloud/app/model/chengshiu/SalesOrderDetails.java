package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/10/31.
 */
@Table("a_chengshiu_sales_order_details")
@CompositePK({ "order_id", "product_id" })
@BelongsToParents({
        @BelongsTo(parent = SalesOrder.class, foreignKeyName = "order_id"),
        @BelongsTo(parent = Product.class, foreignKeyName = "product_id"),
})
public class SalesOrderDetails extends Model{

}
