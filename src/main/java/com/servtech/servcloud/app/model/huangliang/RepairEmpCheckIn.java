package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2016/7/28.
 */

@Table(value = "a_huangliang_repair_emp_check_in")
@CompositePK({ "logically_date", "user_id", "work_shift_name" })
public class RepairEmpCheckIn extends Model {
  static {
    dateFormat("yyyy/MM/dd", "logically_date");
    dateFormat("yyyy/MM/dd HH:mm:ss", "check_in_tsp", "work_shift_start",
        "work_shift_end", "work_shift_check_in_start", "work_shift_check_in_end");
  }
}
