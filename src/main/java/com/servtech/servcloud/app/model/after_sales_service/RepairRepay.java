package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_repair_repay")
@IdName("reply_id")
@BelongsTo(parent = RepairAssign.class,foreignKeyName = "assign_id")
public class RepairRepay extends Model {
}
