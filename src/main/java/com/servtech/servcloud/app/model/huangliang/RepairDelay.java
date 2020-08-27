package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/26 下午 02:44
 */
@Table(value = "a_huangliang_repair_delay")
@CompositePK({ "machine_id", "notify_time" })
public class RepairDelay extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time", "alarm_time");
    }
}
