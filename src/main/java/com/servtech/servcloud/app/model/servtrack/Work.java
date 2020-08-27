package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_servtrack_work")
@IdName("work_id")
@BelongsTo(parent = Product.class, foreignKeyName = "product_id")
public class Work extends Model {
}
