package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/25 下午 06:10
 */
@Table(value = "a_huangliang_notify_delay")
@CompositePK({ "machine_id", "notify_time" })
public class NotifyDelay extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time", "alarm_time");
    }
}
