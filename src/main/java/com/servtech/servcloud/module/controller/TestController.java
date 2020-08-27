package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.googlecode.protobuf.format.JsonFormat;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.mqtt.PBLean;
import com.servtech.servcloud.module.bean.DeviceStatusTemp;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.Device;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/2 下午 15:02
 */
@RestController
@RequestMapping("/test")
public class TestController {
    private static final Logger log = LoggerFactory.getLogger(TestController.class);
    private static final String DEVICE_STATUS_TYPE = "DeviceStatus";
    private static final String STORAGE_TYPE = "Storage";

    @RequestMapping(value = "/mqttMonitorObj", method = RequestMethod.GET)
    public Map<String, Map<String, Object>> mqttMonitorObjData(){
        return ActiveJdbc.operTx(new Operation<Map<String, Map<String, Object>>>() {
            @Override
            public Map<String, Map<String, Object>> operate() {
                Gson gson = new Gson();
                //取得全部目前監控中的device
                List<Map> deviceMaps = Device.findAll().toMaps();
                List<String> deviceIds = new ArrayList<String>();
                for (Map deviceMap : deviceMaps) {
                    deviceIds.add(deviceMap.get("device_id").toString());
                }
                //從MQTTManager取出Storage的資料
                Map<String, List<String>> typeMapMachines = new HashMap<String, List<String>>();
                typeMapMachines.put(STORAGE_TYPE, deviceIds);
                return useTypeMapMachinesGetObj(typeMapMachines);
            }
        });
    }

    @RequestMapping(value = "/mqttObjByType", method = RequestMethod.GET)
    public Map<String, Map<String, Object>> mqttObjByType(@RequestParam("type") final String type){
        return ActiveJdbc.operTx(new Operation<Map<String, Map<String, Object>>>() {
            @Override
            public Map<String, Map<String, Object>> operate() {
                Gson gson = new Gson();
                //取得全部目前監控中的device
                List<Map> deviceMaps = Device.findAll().toMaps();
                List<String> deviceIds = new ArrayList<String>();
                for (Map deviceMap : deviceMaps) {
                    deviceIds.add(deviceMap.get("device_id").toString());
                }
                //從MQTTManager取出Storage的資料
                Map<String, List<String>> typeMapMachines = new HashMap<String, List<String>>();
                typeMapMachines.put(type, deviceIds);
                return useTypeMapMachinesGetObj(typeMapMachines);
            }
        });
    }

    @RequestMapping(value = "/mqttObjByTypeAndMachineId", method = RequestMethod.GET)
    public Map<String, Map<String, Object>> mqttObjByType(
            @RequestParam("type") final String type,
            @RequestParam("machineId") final String machineId){
        return ActiveJdbc.operTx(new Operation<Map<String, Map<String, Object>>>() {
            @Override
            public Map<String, Map<String, Object>> operate() {
                //取得全部目前監控中的device
                List<String> deviceIds = new ArrayList<String>();
                deviceIds.add(machineId);
                //從MQTTManager取出Storage的資料
                Map<String, List<String>> typeMapMachines = new HashMap<String, List<String>>();
                typeMapMachines.put(type, deviceIds);
                return useTypeMapMachinesGetObj(typeMapMachines);
            }
        });
    }

    @RequestMapping(value = "/mqttHasDeviceStatus", method = RequestMethod.GET)
    public Boolean mqttHasDeviceStatusData(){
        Map<String, Map<String, String>> mqttDeviceStatusData = mqttDeviceStatus();
        if(mqttDeviceStatusData.get(DEVICE_STATUS_TYPE).size() > 0){
            return true;
        }else{
            return false;
        }
    }

    @RequestMapping(value = "/mqttDeviceStatusCsv", method = RequestMethod.GET)
    public Map<String, Map<String, String>> mqttDeviceStatusCsvData(){
        String[] gCodeSeqArr = new String[]{"G_CONS()","G_ALAM()", "G_CONS()", "CTL_TCNT(G_CONS_)", "G_MRCO(530,530)", "CTL_TCNT(G_MRCO_530_530)", "G_ALAM()", "CTL_TCNT(G_ALAM_)", "G_SPMS()", "G_ACTF()", "G_TOCP()", "G_PRGM()", "G_ELCT()", "G_CUTT()", "G_OPRT()", "G_SPSO()", "G_FERP()"};
        Map<String, Map<String, String>> jsonMap = mqttDeviceStatus();
        if(jsonMap.containsKey(DEVICE_STATUS_TYPE)){//檢查有deviceStatus就將它改成csv格式
            Map<String, String> deviceStatusByBoxId = jsonMap.get(DEVICE_STATUS_TYPE);
            Map<String, String> deviceStatusCsv = new HashMap<String, String>();
            for(Map.Entry<String, String> deviceStatus:deviceStatusByBoxId.entrySet()){
                DeviceStatusTemp temp = new DeviceStatusTemp(deviceStatus.getValue(), gCodeSeqArr);
                deviceStatusCsv.put(deviceStatus.getKey(), temp.getCsv());
            }
            jsonMap.put(DEVICE_STATUS_TYPE, deviceStatusCsv);
        }

        return jsonMap;
    }

    @RequestMapping(value = "/mqttDeviceStatusObj", method = RequestMethod.GET)
    public Map<String, Map<String, Object>> mqttDeviceStatusObjData(){
        Gson gson = new Gson();
        Map<String, Map<String, String>> jsonMap = mqttDeviceStatus();
        Map<String, Map<String, Object>> jsonObjMap = new HashMap<String, Map<String, Object>>();
        for(Map.Entry<String, Map<String, String>> typeJsonMap:jsonMap.entrySet()){
            Map<String, Object> tempObjMap = new HashMap<String, Object>();
            for(Map.Entry<String, String> typeJson:typeJsonMap.getValue().entrySet()){
                tempObjMap.put(typeJson.getKey(), gson.fromJson(typeJson.getValue(), Object.class));
            }
            jsonObjMap.put(typeJsonMap.getKey(), tempObjMap);
        }
        return  jsonObjMap;
    }

    @RequestMapping(value = "/mqttDeviceStatus", method = RequestMethod.GET)
    public Map<String, Map<String, String>> mqttDeviceStatusData(){
        return  mqttDeviceStatus();
    }

    private Map<String, Map<String, String>> mqttDeviceStatus(){
        return ActiveJdbc.operTx(new Operation<Map<String, Map<String, String>>>() {
            @Override
            public Map<String, Map<String, String>> operate() {
                //取得全部的boxId
                List<Map> boxMaps = Box.findAll().toMaps();
                List<String> boxIds = new ArrayList<String>();
                for (Map deviceMap : boxMaps) {
                    boxIds.add(deviceMap.get("box_id").toString());
                }
                //從MQTTManager取出DeviceStatus的資料
                Map<String, List<String>> typeMapMachines = new HashMap<String, List<String>>();
                typeMapMachines.put(DEVICE_STATUS_TYPE, boxIds);
                Map<String, Map<String, CacheBean>> result = MQTTManager.get(typeMapMachines);
                //將protobuf轉成json字串
                Map<String, Map<String, String>> jsonMap = new HashMap<String, Map<String, String>>();
                Iterator<Map.Entry<String, Map<String, CacheBean>>> it = result.entrySet().iterator();
                while (it.hasNext()) {
                    Map.Entry<String, Map<String, CacheBean>> entry = it.next();
                    Iterator<Map.Entry<String, CacheBean>> cacheBeanIt = entry.getValue().entrySet().iterator();
                    Map<String, String> resultMap = new HashMap<String, String>();
                    while (cacheBeanIt.hasNext()) {
                        Map.Entry<String, CacheBean> cacheBeanEntry = cacheBeanIt.next();
                        resultMap.put(cacheBeanEntry.getKey(), cacheBeanEntry.getValue().asJson());
                    }
                    jsonMap.put(entry.getKey(), resultMap);
                }
                return jsonMap;
            }
        });
    }

    private Map<String, Map<String, Object>> useTypeMapMachinesGetObj(Map<String, List<String>> typeMapMachines){
        Map<String, Map<String, CacheBean>> result = MQTTManager.get(typeMapMachines);
        //將protobuf轉成json物件
        Map<String, Map<String, Object>> jsonMap = new HashMap<String, Map<String, Object>>();
        Iterator<Map.Entry<String, Map<String, CacheBean>>> it = result.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Map<String, CacheBean>> entry = it.next();
            Iterator<Map.Entry<String, CacheBean>> cacheBeanIt = entry.getValue().entrySet().iterator();
            Map<String, Object> resultMap = new HashMap<String, Object>();
            while (cacheBeanIt.hasNext()) {
                Map.Entry<String, CacheBean> cacheBeanMsgEntry = cacheBeanIt.next();
                resultMap.put(cacheBeanMsgEntry.getKey(), cacheBeanMsgEntry.getValue().asJson());
            }
            jsonMap.put(entry.getKey(), resultMap);
        }
        return jsonMap;
    }

    @RequestMapping(method = RequestMethod.GET)
    public String test() {
        throw new RuntimeException("wa haha");
    }

//    @RequestMapping(value = "/tx", method = RequestMethod.GET)
//    public String haha() {
//        log.info("某君");
//        for (int i = 0; i < Integer.MAX_VALUE; i++) {
//            if (i % 100000000 == 0) {
//                log.info("" + i);
//            }
//        }
//        return "結束";
//    }
}
