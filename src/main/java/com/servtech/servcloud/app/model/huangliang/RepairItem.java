package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2016/8/11.
 */
@Table(value = "a_huangliang_repair_item")
@CompositePK({"machine_id", "alarm_time", "repair_code"})
public class RepairItem extends Model {
  static {
    dateFormat("yyyy/MM/dd HH:mm:ss", "alarm_time", "create_time");
  }
}
