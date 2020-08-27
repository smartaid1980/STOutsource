package com.servtech.servcloud.core.mqtt;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.mqtt.exception.MqttMessageFormatException;
import com.servtech.servcloud.core.mqtt.impl.*;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Created by Hubert
 * Datetime: 2016/4/7 下午 02:56
 */
public class CacheBeanFactory {
    private static final Type SARDINE_DATA_TYPE = new TypeToken<Map<String, Map<String, Object>>>(){}.getType();

    public static CacheBean create(String topicName, byte[] bytes) throws MqttMessageFormatException {
        if (topicName == null || bytes == null) {
            throw new NullPointerException("topicName or bytes 不得為 null");
        }

        if (topicName.startsWith("js_")) {
            return new CacheBeanJson(topicName, bytes);
        }

        if (topicName.startsWith("csv_")) {
            return new CacheBeanCsv(topicName, bytes);
        }

        if (topicName.startsWith("xml_device_status")) {
            return new CacheBeanDeviceStatusXml(topicName, bytes);
        }

        return new CacheBeanPBLean(bytes);
    }

    public static List<CacheBean> createFromSardine(String topicName, byte[] bytes) {
        List<CacheBean> result = null;
        Gson gson = new Gson();
        try {
            Map<String, Map<String, Object>> data = gson.fromJson(new String(bytes, "UTF-8"), SARDINE_DATA_TYPE);
            result = new ArrayList<CacheBean>(data.size());

            for (Map.Entry<String, Map<String, Object>> entry : data.entrySet()) {
                String machineId = entry.getKey();
                String content = gson.toJson(entry.getValue());
                result.add(new CacheBeanSardine(topicName, machineId, content));
            }

        } catch (UnsupportedEncodingException e) {
            // 不可能發生...
            e.printStackTrace();
        }

        if (result == null) {
            return Collections.EMPTY_LIST;
        }

        return result;
    }
}
