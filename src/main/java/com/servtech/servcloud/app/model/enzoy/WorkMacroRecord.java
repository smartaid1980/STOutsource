package com.servtech.servcloud.app.model.enzoy;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2017/3/6.
 */
@Table(value = "a_enzoy_work_macro_record")
@CompositePK({ "machine_id", "ctl_datm" })
public class WorkMacroRecord extends Model {
  static {
    dateFormat("yyyy/MM/dd HH:mm:ss", "ctl_datm", "end_datetime", "create_datetime");
  }
}
