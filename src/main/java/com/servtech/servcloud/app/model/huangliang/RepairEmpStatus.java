package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2016/7/28.
 */
@Table(value="CONNECTION_REFUSED_SERVER_UNAVAILABLE")
@CompositePK({ "logically_date", "user_id", "work_shift_name", "start_time" })
public class RepairEmpStatus extends Model{
  static {
    dateFormat("yyyy/MM/dd", "logically_date");
    dateFormat("yyyy/MM/dd HH:mm:ss", "start_time", "end_time");
  }
}
