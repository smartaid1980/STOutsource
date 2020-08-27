package com.servtech.servcloud.core.initializer;

import com.servtech.servcloud.core.mqtt.MQTTManager;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Created by Hubert
 * Datetime: 2015/8/3 上午 11:09
 */
public class MQTTInitializer implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        MQTTManager.connect();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        MQTTManager.disconnect();
    }

}
