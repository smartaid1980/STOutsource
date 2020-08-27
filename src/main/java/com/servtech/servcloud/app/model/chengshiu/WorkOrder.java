package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/3.
 */
@Table("a_chengshiu_work_order")
@IdName("work_id")
@BelongsTo(parent = DemandOrder.class, foreignKeyName = "demand_id")
public class WorkOrder extends Model {

}
