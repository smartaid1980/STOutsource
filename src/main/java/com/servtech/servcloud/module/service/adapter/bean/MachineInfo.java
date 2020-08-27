package com.servtech.servcloud.module.service.adapter.bean;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class MachineInfo {
    private String id;
    private String name;
    private String brand;
    private Map<String, String> param;

    public String getId() {
        return id;
    }

    public MachineInfo setId(String id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public MachineInfo setName(String name) {
        this.name = name;
        return this;
    }

    public String getBrand() {
        return brand;
    }

    public MachineInfo setBrand(String brand) {
        this.brand = brand;
        return this;
    }

    public Map<String, String> getParam() {
        return param;
    }

    public MachineInfo addParam(String name, String value) {
        if (this.param == null) {
            this.param = new LinkedHashMap<String, String>();
        }
        this.param.put(name, value);
        return this;
    }

}
