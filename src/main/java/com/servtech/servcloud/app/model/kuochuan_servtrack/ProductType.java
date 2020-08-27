package com.servtech.servcloud.app.model.kuochuan_servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/30.
 */
@Table("a_kuochuan_servtrack_product_type")
@IdName("product_type_id")
@BelongsToParents({
        @BelongsTo(parent = Staff.class, foreignKeyName = "staff_id"),
})
public class ProductType extends Model {
}
