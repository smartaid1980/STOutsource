package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/10/13.
 */
@Table("a_chengshiu_store_product")
@CompositePK({ "customer_id", "product_id" })
@BelongsToParents({
        @BelongsTo(parent = Customer.class, foreignKeyName = "customer_id")
})
public class StoreProduct extends Model {
}
