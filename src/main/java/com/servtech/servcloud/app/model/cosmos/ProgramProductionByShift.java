package com.servtech.servcloud.app.model.cosmos;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_cosmos_program_production_by_shift")
@CompositePK({"date", "work_shift", "machine_id", "operator_id", "order_no", "part_no"})

public class ProgramProductionByShift extends Model {
}
