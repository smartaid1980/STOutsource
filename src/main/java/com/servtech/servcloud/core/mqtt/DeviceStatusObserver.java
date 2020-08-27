package com.servtech.servcloud.core.mqtt;

public interface DeviceStatusObserver {
    void onMessage(Object data);
}
