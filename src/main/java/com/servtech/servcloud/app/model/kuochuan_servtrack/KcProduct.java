package com.servtech.servcloud.app.model.kuochuan_servtrack;

import com.servtech.servcloud.app.model.servtrack.Product;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/30.
 */
@Table("a_kuochuan_servtrack_product")
@IdName("product_id")
@BelongsToParents({
        @BelongsTo(parent = Product.class, foreignKeyName = "product_id"),
        @BelongsTo(parent = ProductType.class, foreignKeyName = "product_type_id")
})
public class KcProduct extends Model {
}
