package com.servtech.servcloud.core.mqtt.impl;

import com.google.protobuf.InvalidProtocolBufferException;
import com.googlecode.protobuf.format.JsonFormat;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.PBLean;
import com.servtech.servcloud.core.mqtt.exception.MqttMessageFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Hubert
 * Datetime: 2016/4/7 下午 01:56
 */
public class CacheBeanPBLean implements CacheBean {
    private static final Logger log = LoggerFactory.getLogger(CacheBeanPBLean.class);

    private PBLean.PBLeanMsg pbLeanMsg;

    public CacheBeanPBLean(byte[] bytes) throws MqttMessageFormatException {
        try {
            this.pbLeanMsg = PBLean.PBLeanMsg.parseFrom(bytes);
        } catch (InvalidProtocolBufferException e) {
            log.warn("PBLean 格式有誤...", e);
            throw new MqttMessageFormatException(e.getMessage());
        }
    }

    @Override
    public String getType() {
        return pbLeanMsg.getType();
    }

    @Override
    public String getMachineId() {
        return pbLeanMsg.getMachine();
    }

    @Override
    public String asJson() {
        return JsonFormat.printToString(pbLeanMsg);
    }
}
