package com.servtech.servcloud.app.model.downtime_analysis;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Mike on 2019/07/04.
 */
@Table("a_work_macro_record_log")
@CompositePK({"machine_id","macro_create_time", "create_time"})

public class WorkMacroRecordLog extends Model {
}
