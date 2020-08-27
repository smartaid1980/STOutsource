package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/10/14 下午 04:15
 */
@Table(value = "a_huangliang_utilization_notify")
@CompositePK({ "machine_id", "notify_time" })
public class UtilizationNotify extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time");
    }
}
