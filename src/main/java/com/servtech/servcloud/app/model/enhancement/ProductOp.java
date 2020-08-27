package com.servtech.servcloud.app.model.enhancement;


import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("a_enhancement_product_op")
@CompositePK({"product_id", "op"})
@BelongsToParents({
        @BelongsTo(parent = Product.class, foreignKeyName = "product_id"),
        @BelongsTo(parent = Process.class, foreignKeyName = "process_code")
})
public class ProductOp extends Model {
}
