package com.servtech.servcloud.app.model.cosmos;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_cosmos_program_production")
@CompositePK({"date", "work_shift", "machine_id", "program_name", "operator_id", "order_no", "part_no"})

public class ProgramProduction extends Model {
}
