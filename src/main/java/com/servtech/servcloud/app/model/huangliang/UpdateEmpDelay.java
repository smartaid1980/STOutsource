package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/29 下午 03:26
 */
@Table(value = "a_huangliang_update_emp_delay")
@CompositePK({ "machine_id", "notify_time" })
public class UpdateEmpDelay extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time");
    }
}
