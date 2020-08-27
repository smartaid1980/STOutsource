package com.servtech.servcloud.app.model.downtime_analysis;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Fred on 2019/06/03.
 */
@Table("a_work_macro_record")
@CompositePK({"machine_id","macro_create_time"})

public class WorkMacroRecord extends Model {
}
