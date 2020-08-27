package com.servtech.servcloud.connect.bean;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class ResponseBody7 {
    private static final int OK = 0;
    private static final int SERVBOX_NOT_OK = 1;
    private static final int MQTT_NOT_OK = 2;

    private int code;

    private ResponseBody7(int code) {
        this.code = code;
    }

    public String getMessage() {
        switch (code) {
            case OK:
                return "Everything is ok!";
            case SERVBOX_NOT_OK:
                return "ServBox is not connected...";
            case MQTT_NOT_OK:
                return "MQTT is not connected...";
            default:
                return "Something wrong...";
        }
    }

    public static ResponseBody7 ok() {
        return new ResponseBody7(OK);
    }

    public static ResponseBody7 servboxNotConnected() {
        return new ResponseBody7(SERVBOX_NOT_OK);
    }

    public static ResponseBody7 mqttNotConnected() {
        return new ResponseBody7(MQTT_NOT_OK);
    }
}
