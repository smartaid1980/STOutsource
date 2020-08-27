package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_production_scheduling")
@CompositePK({"order_id", "schedule_time", "machine_id"})
public class ProductionScheduling extends Model {
}