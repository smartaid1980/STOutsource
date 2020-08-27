package com.servtech.servcloud.core.mqtt;

/**
 * Created by Hubert
 * Datetime: 2016/4/7 下午 01:44
 */
public interface CacheBean {
    String getType();
    String getMachineId();
    String asJson();
}
