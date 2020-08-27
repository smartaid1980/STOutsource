package com.servtech.servcloud.module.bean;

import com.google.gson.Gson;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Created by Kevin Big Big on 2016/11/23.
 */
public class DeviceStatusXml {//將DeviceStatusXml轉換成DeviceStatus2格式
    private static final Logger log = LoggerFactory.getLogger(DeviceStatusXml.class);
    private static final int MACHINE_ID_INDEX = 0;
    private static final int VALUE_INDEX = 1;

    // 外機台，內 gCode
    private Map<String, Machine> machineGCodeMap = new LinkedHashMap<String, Machine>();

    public DeviceStatusXml(byte[] bytes) throws Exception {
        this(new String(bytes, "UTF-8"));
    }

    public DeviceStatusXml(String content) throws Exception {
        transpose(getData(str2dom(content)));
    }

    //轉dom
    private Element str2dom(String content) throws DocumentException {
        Document doc = DocumentHelper.parseText(content);
        return doc.getRootElement().element("record").element("params");
    }

    //CacheBeanDeviceStatusXml轉出的格式
    private Map<String, Map<String, List<String[]>>> getData(Element paramsElem) throws Exception{
        Map<String, Map<String, List<String[]>>> data = new HashMap<String, Map<String, List<String[]>>>();
        if(paramsElem == null){
            return data;
        }
        List<?> params = paramsElem.elements();
        for(Object param:params) {
            Element temp = (Element) param;
            String paramName = temp.attribute("name").getValue();
            String valueText = temp.element("contents").element("content").element("value").getTextTrim();
            if(!data.containsKey(paramName)){
                data.put(paramName, new HashMap<String, List<String[]>>());
            }
            Gson gson = new Gson();
            String[][] matrix = gson.fromJson(valueText, String[][].class);
            for(String[] elements:matrix){
                if(elements.length >= 2){//[機台,值]，所以至少要兩欄
                    String[] value;
                    if(elements[VALUE_INDEX].contains("[")){//有括號表示，是陣列
                        value = gson.fromJson(elements[VALUE_INDEX], String[].class);
                    }else{//不是陣列，自己建一個陣列放入
                        value = new String[]{elements[VALUE_INDEX]};
                    }
                    if(!data.get(paramName).containsKey(elements[MACHINE_ID_INDEX])){
                        data.get(paramName).put(elements[MACHINE_ID_INDEX], new ArrayList<String[]>());
                    }
                    data.get(paramName).get(elements[MACHINE_ID_INDEX]).add(value);//*** 放入單系統
                }else{
                    log.warn("xml_device_status param value length < 2");
                }
            }
        }
        return data;
    }

    //轉換成DeviceStatus2的格式
    private void transpose(Map<String, Map<String, List<String[]>>> data){
        for(Map.Entry<String, Map<String, List<String[]>>> gCodeMap:data.entrySet()){
            String gCode = gCodeMap.getKey();
            for(Map.Entry<String, List<String[]>> machines:gCodeMap.getValue().entrySet()){
                String machineId = machines.getKey();
                String value = Arrays.toString(machines.getValue().get(0));
                if (machineGCodeMap.containsKey(machineId)) {
                    machineGCodeMap.get(machineId).values.put(gCode, value);
                } else {
                    Machine newMachine = new Machine(machineId);
                    newMachine.values.put(gCode, value);
                    machineGCodeMap.put(machineId, newMachine);
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
