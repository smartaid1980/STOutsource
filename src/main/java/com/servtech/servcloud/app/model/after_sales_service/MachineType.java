package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/11.
 */
@Table("a_aftersalesservice_machine_type")
@IdName("machine_type_id")
@BelongsTo(parent = Product.class, foreignKeyName = "product_id")
public class MachineType extends Model {
}
