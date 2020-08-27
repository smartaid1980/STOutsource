package com.servtech.servcloud.core.mqtt.impl;

import com.servtech.servcloud.core.mqtt.CacheBean;

/**
 * Created by Hubert
 * Datetime: 2016/12/26 下午 02:44
 */
public class CacheBeanSardine implements CacheBean {

    private String topic;
    private String machineId;
    private String content;

    public CacheBeanSardine(String topic, String machineId, String content) {
        this.topic = topic;
        this.machineId = machineId;
        this.content = content;
    }

    @Override
    public String getType() {
        return topic;
    }

    @Override
    public String getMachineId() {
        return machineId;
    }

    @Override
    public String asJson() {
        return content;
    }
}
