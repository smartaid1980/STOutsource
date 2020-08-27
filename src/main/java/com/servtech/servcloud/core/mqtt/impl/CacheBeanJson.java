package com.servtech.servcloud.core.mqtt.impl;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.exception.MqttMessageFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 格式:
 *   {
 *       "machineId": "machine id",
 *       "data": "your json string"
 *   }
 *
 * Created by Hubert
 * Datetime: 2016/4/7 下午 01:59
 */
public class CacheBeanJson implements CacheBean {
    private static final Logger log = LoggerFactory.getLogger(CacheBeanJson.class);

    private String type;
    private String machineId;
    private String data;

    public CacheBeanJson(String topic, byte[] bytes) throws MqttMessageFormatException {
        this.type = topic;

        try {
            JsonParser parser = new JsonParser();
            JsonElement jsonElement = parser.parse(new String(bytes, "UTF-8"));
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            this.machineId = jsonObject.getAsJsonPrimitive("machineId").getAsString();
            this.data = jsonObject.getAsJsonPrimitive("data").getAsString();
        } catch (Exception e) {
            log.warn("Topic " + this.type + " 格式有誤...");
            log.warn("{\"machineId\":\"yourMachineId\",\"data\":\"your json format data\"}");
            throw new MqttMessageFormatException();
        }
    }

    @Override
    public String getType() {
        return this.type;
    }

    @Override
    public String getMachineId() {
        return this.machineId;
    }

    @Override
    public String asJson() {
        return this.data;
    }
}
