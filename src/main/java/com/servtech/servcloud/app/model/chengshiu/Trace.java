package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/14.
 */
@Table("a_chengshiu_trace")
@IdName("trace_id")
@BelongsTo(parent = Product.class, foreignKeyName = "product_id")
public class Trace extends Model {
}
