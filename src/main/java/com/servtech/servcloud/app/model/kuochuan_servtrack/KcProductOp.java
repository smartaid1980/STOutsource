package com.servtech.servcloud.app.model.kuochuan_servtrack;

import com.servtech.servcloud.app.model.servtrack.ProductOp;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/25.
 */
@Table("a_kuochuan_servtrack_product_op")
@CompositePK({ "product_id", "op"})
@BelongsToParents({
        @BelongsTo(parent = ProductOp.class, foreignKeyName = "product_id"),
        @BelongsTo(parent = ProductOp.class, foreignKeyName = "op")
})
public class KcProductOp extends Model {
}
