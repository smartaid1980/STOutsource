package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/9.
 */
@Table("a_chengshiu_work_order_duration")
@CompositePK({ "work_id", "act_start_time" })
@BelongsTo(parent = WorkOrder.class, foreignKeyName = "work_id")
public class WorkOrderDuration extends Model{
}
