package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2018/1/24.
 */
@Table("a_chengshiu_store_sales_record")
@CompositePK({"customer_id", "sale_time", "product_id"})
@BelongsToParents({
        @BelongsTo(parent = Customer.class, foreignKeyName = "customer_id"),
        @BelongsTo(parent = StoreProduct.class, foreignKeyName = "product_id")
})
public class StoreSalesRecord extends Model {
}
