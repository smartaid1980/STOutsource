package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_customer")
@IdName("cus_id")
@BelongsToParents({
        @BelongsTo(parent = CusTrade.class,foreignKeyName = "trade_id"),
        @BelongsTo(parent = CusArea.class,foreignKeyName = "area_id"),
        @BelongsTo(parent = CusFactor.class,foreignKeyName = "factor_id")
})
public class Customer extends Model {
}
