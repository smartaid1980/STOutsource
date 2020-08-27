package com.servtech.servcloud.app.controller.huangliang_matStock.util;

import java.util.Map;

public class RecordAfter {

    public static void putCreateAndModify(Map data, String user, Long timeMillis) {
        putCreate(data, user, timeMillis);
        putModify(data, user, timeMillis);
    }

    public static void putCreate(Map data, String user, Long timeMillis) {
        data.put("create_by", user);
        data.put("create_time", new java.sql.Timestamp(timeMillis));
    }

    public static void putModify(Map data, String user, Long timeMillis) {
        data.put("modify_by", user);
        data.put("modify_time", new java.sql.Timestamp(timeMillis));
    }
}