package com.servtech.servcloud.app.controller.hanshiang;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.module.bean.DeviceStatusTemp;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.Device;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2016/6/29 下午 04:46
 */
@RestController
@RequestMapping("/hanshiang")
public class DeviceStatusController {

    private final static Logger log = LoggerFactory.getLogger(DeviceStatusController.class);

    @RequestMapping()
    public List<Map<String, String>> deviceStatus() {

        final String[] gCodeSeqArr = new String[]{"G_CONS()","G_ALAM()", "G_CONS()", "CTL_TCNT(G_CONS_)", "G_MRCO(530,530)", "CTL_TCNT(G_MRCO_530_530)", "G_ALAM()", "CTL_TCNT(G_ALAM_)", "G_SPMS()", "G_ACTF()", "G_TOCP()", "G_PRGM()", "G_ELCT()", "G_CUTT()", "G_OPRT()", "G_SPSO()", "G_FERP()"};
        final String[] keyIndex = new String[]{
                "timestamp",
                "boxId",
                "deviceName",
                "Devices_Status",
                "ServBox_Info",
                "Machine_status",
                "Value_keep_period_Machine_status",
                "Macro_value_530_530",
                "Value_keep_period_Macro_value_530_530",
                "Device_alarm",
                "Value_keep_period_Device_alarm",
                "Command_spindle_speed",
                "Actual_axis_feedrate",
                "Parts_total",
                "Main_program_number",
                "Power_on_time",
                "Cutting_time",
                "Operation_time",
                "Spindle_speed_adjustment",
                "Feedrate_adjustment"
        };
        final int keyIndexLength = keyIndex.length;

        Map<String, Map<String, String>> jsonMap = mqttDeviceStatus();
        final Map<String, String> machineNameMap = machineNameMap();

        if(jsonMap.containsKey("DeviceStatus")){//檢查有deviceStatus就將它改成csv格式
            Map<String, String> deviceStatusByBoxId = jsonMap.get("DeviceStatus");
            Map<String, String> deviceStatusCsv = new HashMap<String, String>();
            for(Map.Entry<String, String> deviceStatus:deviceStatusByBoxId.entrySet()){
                DeviceStatusTemp temp = new DeviceStatusTemp(deviceStatus.getValue(), gCodeSeqArr);

                return Lists.transform(temp.getMatrix(), new Function<List<String>, Map<String, String>>() {
                    @Override
                    public Map<String, String> apply(List<String> input) {
                        Map<String, String> result = new LinkedHashMap<String, String>();
                        int inputSize = input.size();
                        for (int i = 0; i < inputSize; i++) {
                            if (i < keyIndexLength) {

                                // deviceName
                                if (i == 2) {
                                    String deviceName = machineNameMap.get(input.get(i));
                                    if (deviceName == null) {
                                        result.put(keyIndex[i], input.get(i));
                                    } else {
                                        result.put(keyIndex[i], deviceName);
                                    }

                                // 其他
                                } else {
                                    result.put(keyIndex[i], input.get(i));
                                }
                            }
                        }
                        return result;
                    }
                });
//                deviceStatusCsv.put(deviceStatus.getKey(), temp.getCsv());
            }
//            jsonMap.put("DeviceStatus", deviceStatusCsv);
        }
        return new ArrayList<Map<String, String>>();
    }

    private Map<String, Map<String, String>> mqttDeviceStatus() {
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
                typeMapMachines.put("DeviceStatus", boxIds);
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

    private Map<String, String> machineNameMap() {
        return ActiveJdbc.oper(new Operation<Map<String, String>>() {
            @Override
            public Map<String, String> operate() {
                Map<String, String> result = new HashMap<String, String>();
                for (Map device : Device.findAll().toMaps()) {
                    result.put(device.get("device_id").toString(), device.get("device_name").toString());
                }
                return result;
            }
        });
    }
}
