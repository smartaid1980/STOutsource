package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_repair_assign")
@IdName("assign_id")
@BelongsTo(parent = Repair.class,foreignKeyName = "repair_id")
public class RepairAssign extends Model {
}
