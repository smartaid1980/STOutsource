package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/26 下午 02:45
 */
@Table(value = "a_huangliang_undispatch")
@CompositePK({ "machine_id", "notify_time" })
public class Undispatch extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time", "alarm_time");
    }
}
