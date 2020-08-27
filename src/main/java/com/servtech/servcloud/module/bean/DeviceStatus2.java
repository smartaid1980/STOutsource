package com.servtech.servcloud.module.bean;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.google.protobuf.InvalidProtocolBufferException;
import com.googlecode.protobuf.format.JsonFormat;
import com.servtech.servcloud.core.mqtt.PBLean;

import java.util.*;

/**
 * 這個比較好用啦啦啦啦啦啦啦啦啦啦啦啦啦....................
 *
 * Created by Hubert
 * Datetime: 2016/10/19 下午 04:01
 */
public class DeviceStatus2 {

    // 外機台，內 gCode
    private Map<String, Machine> machineGCodeMap = new LinkedHashMap<String, Machine>();

    public DeviceStatus2(byte[] bytes) throws InvalidProtocolBufferException {
        this(JsonFormat.printToString(PBLean.PBLeanMsg.parseFrom(bytes)));
    }

    public DeviceStatus2(String json) {
        Gson gson = new Gson();
        Map<String, Object> obj = (Map<String, Object>) gson.fromJson(json, Object.class);

        for (Map.Entry<String, Object> entry : obj.entrySet()) {
            Object entryValue = entry.getValue();
            if (entry.getKey().equals("type") && !entryValue.equals("DeviceStatus")) {
                continue;
            }

            if (entryValue.getClass().equals(LinkedTreeMap.class)) {
                Map<String, Object> result = (Map<String, Object>) entryValue;
                if (result.containsKey("stringValues")) {
                    List<Object> stringValues = (List<Object>) result.get("stringValues");
                    if (stringValues.size() > 0) {
                        for (Object stringValue : stringValues) {
                            String gCode = ((Map<String, String>) ((Map<String, Object>) stringValue).get("signal")).get("id");
                            String arrayStr = (((Map<String, List<String>>) ((List<Object>) ((Map<String, Object>) stringValue).get("values")).get(0)).get("array")).get(0);
                            String[][] machines = gson.fromJson(arrayStr, String[][].class);
                            for (String[] machine : machines) {
                                if (machine.length >= 2) {
                                    if (machineGCodeMap.containsKey(machine[0])) {
                                        machineGCodeMap.get(machine[0]).values.put(gCode, machine[1]);
                                    } else {
                                        Machine newMachine = new Machine(machine[0]);
                                        newMachine.values.put(gCode, machine[1]);
                                        machineGCodeMap.put(machine[0], newMachine);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public Collection<Machine> iter() {
        return machineGCodeMap.values();
    }

    public Machine getMachine(String machineId) {
        return machineGCodeMap.get(machineId);
    }

    public static class Machine {
        private String id;
        private Map<String, String> values = new LinkedHashMap<String, String>();

        public Machine(String id) {
            this.id = id;
        }

        public String getId() {
            return id;
        }

        public String getCmdValue(String cmd) {
            return values.get(cmd);
        }

        public Collection<Map.Entry<String, String>> iter() {
            return values.entrySet();
        }
    }

}
