package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_non_production_log")
@CompositePK({"machine_id", "exp_time", "purpose", "remove_time"})
public class NonProductionLog extends Model {
}