package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/10/31.
 */
@Table("a_chengshiu_sales_order")
@IdName("order_id")
@BelongsTo(parent = Customer.class, foreignKeyName = "customer_id")
public class SalesOrder extends Model{

}
