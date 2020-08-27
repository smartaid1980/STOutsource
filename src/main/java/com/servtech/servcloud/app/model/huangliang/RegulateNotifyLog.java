package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny
 * Datetime: 2018/11/20 下午 05:48
 */
@Table(value = "a_huangliang_regulate_notify_log")
@CompositePK({ "machine_id", "notify_time" })
public class RegulateNotifyLog extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "notify_time");
    }
}
