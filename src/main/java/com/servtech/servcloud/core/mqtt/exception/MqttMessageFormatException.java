package com.servtech.servcloud.core.mqtt.exception;

/**
 * Created by Hubert
 * Datetime: 2016/4/7 下午 03:04
 */
public class MqttMessageFormatException extends Exception {
    public MqttMessageFormatException() {
    }

    public MqttMessageFormatException(String message) {
        super(message);
    }
}
