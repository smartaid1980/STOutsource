package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/10/31.
 */
@Table("a_chengshiu_demand2_order")
@CompositePK({ "demand_id", "reason_id" })
@BelongsTo(parent = DemandReason.class, foreignKeyName = "reason_id")
public class Demand2Order extends Model{

}
