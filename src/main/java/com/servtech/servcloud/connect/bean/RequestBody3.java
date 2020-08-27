package com.servtech.servcloud.connect.bean;

import com.servtech.servcloud.module.service.adapter.bean.MachineInfo;

import java.util.Map;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class RequestBody3 {
    private String key;
    private MachineInfo data;

    public String getKey() {
        return key;
    }

    public String getId() {
        return data.getId();
    }

    public String getName() {
        return data.getName();
    }

    public String getBrand() {
        return data.getBrand();
    }

    public Map<String, String> getParams() {
        return data.getParam();
    }

    public MachineInfo getMachineInfo() {
        return data;
    }
}
