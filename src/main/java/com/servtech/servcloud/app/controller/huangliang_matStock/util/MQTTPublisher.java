package com.servtech.servcloud.app.controller.huangliang_matStock.util;

import com.google.gson.Gson;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MQTTPublisher {
    private static final Logger log = LoggerFactory.getLogger(MQTTPublisher.class);
    private Gson gson = new Gson();

    public MQTTPublisher() {

    }

    public void publish(String msg, String topic) {
        msg = gson.toJson(new MQttObj(msg));
        log.info(msg);
        MQTTManager.publish(msg, "Platform_Notice");

    }

    class MQttObj {
        String message;

        MQttObj(String message) {
            this.message = message;
        }
    }
}
