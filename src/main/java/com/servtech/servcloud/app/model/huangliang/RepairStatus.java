package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/26 下午 02:47
 */
@Table(value = "a_huangliang_repair_status")
@CompositePK({ "machine_id", "alarm_time", "start_time" })
public class RepairStatus extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "alarm_time", "start_time");
    }
}
