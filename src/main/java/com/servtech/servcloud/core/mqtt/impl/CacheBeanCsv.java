package com.servtech.servcloud.core.mqtt.impl;

import com.google.gson.Gson;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.exception.MqttMessageFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.UnsupportedEncodingException;

/**
 * 格式:
 *   第一行: machineId
 *   第二行: column|column|column|column
 *
 * 分格也可為逗號
 *
 * Created by Hubert
 * Datetime: 2016/4/7 下午 02:40
 */
public class CacheBeanCsv implements CacheBean {
    private static final Logger log = LoggerFactory.getLogger(CacheBeanCsv.class);

    private String type;
    private String machineId;
    private String[] data;

    public CacheBeanCsv(String topic, byte[] bytes) throws MqttMessageFormatException {
        this.type = topic;
        try {
            String content = new String(bytes, "UTF-8");
            String[] contentSplitted = content.split("\n");
            if (contentSplitted.length < 2) {
                throw new MqttMessageFormatException("Topic " + this.type + " 格式第一行須為機台編號，第二行才是 csv 資料...");
            }

            this.machineId = contentSplitted[0].trim();
            if (this.machineId.contains("|") || this.machineId.contains(",")) {
                throw new MqttMessageFormatException("Topic " + this.type + " 機台編號不得包含「|」或「,」");
            }

            String contentData = contentSplitted[1].trim();
            if (contentData.contains("|")) {
                this.data = contentData.split("\\|");
            } else {
                this.data = contentData.split(",");
            }

        } catch (UnsupportedEncodingException e) {
            log.warn("不可能發生的編碼錯誤", e);
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
        return new Gson().toJson(data);
    }
}
