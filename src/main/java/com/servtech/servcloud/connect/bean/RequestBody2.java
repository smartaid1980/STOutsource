package com.servtech.servcloud.connect.bean;

import java.util.*;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class RequestBody2 {
    private String key;
    private Map<String, String> data;

    public String getKey() {
        return key;
    }

    public Set<String> getMachineIds() {
        if (data != null) {
            return data.keySet();
        }
        return Collections.emptySet();
    }

    public Collection<String> getMachineNames() {
        if (data != null) {
            return data.values();
        }
        return Collections.emptySet();
    }

    public Set<Map.Entry<String, String>> getMachineIdName() {
        if (data != null) {
            return data.entrySet();
        }
        return Collections.EMPTY_SET;
    }
}
