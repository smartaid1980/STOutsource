package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;

import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.*;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2016/5/3.
 */

@RestController
@RequestMapping("/alarm")
public class AlarmController {
    private static final Logger log = LoggerFactory.getLogger(AlarmController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));

                    Alarm alarm = new Alarm();
                    alarm.fromMap(data);
                    if (alarm.insert()) {
                        //自建pks給Hubert的crudtable使用
                        Map pks = new HashMap();
                        pks.put("alarm_id", alarm.get("alarm_id"));
                        pks.put("cnc_id", alarm.get("cnc_id"));
                        pks.put("machine_type_id", alarm.get("machine_type_id"));
                        return success(pks);
                    } else {
                        return fail("create alarm fail...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Alarm alarm = new Alarm();
                alarm.fromMap(data);
                if (alarm.saveIt()) {
                    //自建pks給Hubert的crudtable使用
                    Map pks = new HashMap();
                    pks.put("alarm_id", alarm.get("alarm_id"));
                    pks.put("cnc_id", alarm.get("cnc_id"));
                    pks.put("machine_type_id", alarm.get("machine_type_id"));
                    return success(pks);
                } else {
                    return fail("update alarm fail...");
                }
            }
        });
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                List<Map> alarms = Alarm.findAll().include(CncBrand.class, MachineType.class).toMaps();
                for(Map alarm:alarms){//自建pks給Hubert的crudtable使用
                    Map pks = new HashMap();
                    pks.put("alarm_id", alarm.get("alarm_id"));
                    pks.put("cnc_id", alarm.get("cnc_id"));
                    pks.put("machine_type_id", alarm.get("machine_type_id"));
                    alarm.put("pks", pks);
                }
                return success(alarms);
            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try{
                    System.out.println(new Gson().toJson(idList));
                    int deleteSize = idList.length;
                    for(int count=0; count<deleteSize; count++){
                        Map pks = (Map) idList[count];
                        int deleteAmount = Alarm.delete("alarm_id = ? AND cnc_id = ? AND machine_type_id = ?",
                                pks.get("alarm_id"), pks.get("cnc_id"), pks.get("machine_type_id"));
                    }
                    return success();
                } catch (Exception e){
                    log.warn("delete fail: ", e.getMessage());
                    return fail(e.getMessage());
                }
            }
        });
    }

    @RequestMapping(value = "/readBySource", method = GET)
    public RequestResult<List<Map>> readBySource(@RequestParam("source") final String source) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Base.findAll(
                        "SELECT a.alarm_id, a.alarm_status, a.cnc_id, cb.name AS cnc_name, a.machine_type_id, a.description" +
                                " FROM m_alarm a, m_cnc_brand cb" +
                                " WHERE a.cnc_id = cb.cnc_id AND source = ?", source));
            }
        });
    }

    @RequestMapping(value = "/readByMachineId", method = POST)
    public RequestResult<?> readByMachineId(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Map<String, List<Object>> deviceCodeMap = (Map<String, List<Object>>) data;
                Map<String, AlarmCodeByCncTemp> result = new HashMap<String, AlarmCodeByCncTemp>();
                DecimalFormat df = new DecimalFormat("#");
                for(Map.Entry<String, List<Object>> deviceCode:deviceCodeMap.entrySet()){
                    //組alarm code sql語法
                    List<Object> alarmCodes = deviceCode.getValue();
                    StringBuilder alarmCodeGroupSql = new StringBuilder();
                    alarmCodeGroupSql.append("(");
                    for(int index=0; index<alarmCodes.size(); index++){
                        if(index > 0){
                            alarmCodeGroupSql.append(",");
                        }
                        String temp;//不知道試中了什麼巫術...前端傳來的alarm code有時是字串有時是數字...目前只能這樣解
                        if(alarmCodes.get(index) instanceof Number){
                            temp = df.format(alarmCodes.get(index));
                        }else{
                            temp = alarmCodes.get(index).toString();
                        }
                        alarmCodeGroupSql.append("'").append(temp).append("'");
                    }
                    alarmCodeGroupSql.append(")");
                    log.info("alarmCodeGroupSql: {}", alarmCodeGroupSql.toString());
                    //找出該機台符合的alarm code
                    List<Map> alarmCodeInfos = Base.findAll(
                            "SELECT d.device_id, d.device_name, d.device_type AS machine_type_id," +
                                    " dcb.cnc_id, a.alarm_id, a.alarm_status, a.description" +
                            " FROM m_device d, m_device_cnc_brand dcb, m_alarm a" +
                            " WHERE d.device_id = dcb.device_id AND d.device_id = ? AND" +
                                    " a.cnc_id = dcb.cnc_id AND a.machine_type_id = d.device_type AND a.alarm_id IN "
                                    + alarmCodeGroupSql.toString(), deviceCode.getKey());
                    result.put(deviceCode.getKey(), new AlarmCodeByCncTemp(alarmCodeInfos));
                }
                return success(result);
            }
        });
    }
    /* 舊版　*/
    @RequestMapping(value = "/readByDeviceId", method = POST)
    public RequestResult<Map> readByDeviceId(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<Map>>() {
            @Override
            public RequestResult<Map> operate() {
                //收集alarmCode
                Map<String, Set<String>> cncBrandAlarmCodeMap = new HashMap<String, Set<String>>();
                Map<String, String> deviceCncBrandMap = new HashMap<String, String>();
                Map result = new HashMap();//結果 HashMap<String, AlarmCodeByCncTemp>()
                List<String> deviceIds = new ArrayList<String>();

                Map<String, List<String>> deviceCodeMap = (Map<String, List<String>>) data;

                //取出機台id
                for(Map.Entry<String, List<String>> entry:deviceCodeMap.entrySet()){
                    //System.out.println(entry.getKey());
                    deviceIds.add(entry.getKey());
                }
                //找出全部機台的廠牌
                List<DeviceCncBrand> deviceCncBrands = DeviceCncBrand.where(" device_id IN (" + Util.strSplitBy("?", ",", deviceIds.size()) + ")", deviceIds.toArray());
                for(DeviceCncBrand deviceCncBrand:deviceCncBrands){
                    //廠牌不存在就建立
                    if(!cncBrandAlarmCodeMap.containsKey(deviceCncBrand.getString("cnc_id"))){
                        cncBrandAlarmCodeMap.put(deviceCncBrand.getString("cnc_id"), new HashSet<String>());
                    }
                    //例: fanuc:[1001, 1002, 1003, 1005],
                    //    mitsubishi:[1001, 1002]
                    cncBrandAlarmCodeMap.get(deviceCncBrand.getString("cnc_id")).addAll(deviceCodeMap.get(deviceCncBrand.getString("device_id")));
                    deviceCncBrandMap.put(deviceCncBrand.getString("device_id"), deviceCncBrand.getString("cnc_id"));//device:cncBrand
                }
                Map<String, Map<String, String>> alarmCodeStatusMap = new HashMap<String, Map<String, String>>();
                for(Map.Entry<String, Set<String>> entry:cncBrandAlarmCodeMap.entrySet()){
                    //key:String cncId, value:Set<String> alarmCode
                    List<Alarm> cncAlarmCodes = Alarm.where(" cnc_id = '" + entry.getKey() + "' AND alarm_id IN (" + Util.strSplitBy("?", ",", entry.getValue().size()) + ")", entry.getValue().toArray());
                    for(Alarm cncAlarmCode:cncAlarmCodes){
                        if(!alarmCodeStatusMap.containsKey(entry.getKey())){
                            alarmCodeStatusMap.put(entry.getKey(), new HashMap<String, String>());
                        }
                        //例: mitsubishi:{"1001":1001-mitsubishi, "1002":1002-mitsubishi}
                        alarmCodeStatusMap.get(entry.getKey()).put(cncAlarmCode.getString("alarm_id"), cncAlarmCode.getString("alarm_status"));
                    }
                }
                //替全部機台設置alarmCode status
                for(String deviceId:deviceIds){
                    //機台有綁定廠台
                    if(deviceCncBrandMap.containsKey(deviceId)){
                        String cncBrand = deviceCncBrandMap.get(deviceId);
                        Map<String, String> cncBrandAlarmStatusMap = alarmCodeStatusMap.get(cncBrand);
                        AlarmCodeByCncTemp alarmCodeByCncTemp = new AlarmCodeByCncTemp(cncBrand, cncBrandAlarmStatusMap);
                        result.put(deviceId, alarmCodeByCncTemp);
                    }
                }
                return success(result);
            }
        });
    }

    //alarm code綁定廠牌最後結果的結構 (為了讓資料傳到前端時的JSON是{codeId:"xxx", codes:{"100": "xxx", "200": "xxx"}})
    class AlarmCodeByCncTemp {
        private String cncId;
        private String machineTypeId;
        private Map<String, String> codes;
        private Map<String, String> codeDescs;

        //舊版
        public AlarmCodeByCncTemp(String cncId, Map<String, String> codes){
            this.cncId = cncId;
            this.codes = codes;
        }

        //新版
        public AlarmCodeByCncTemp(List<Map> datas){
            if(datas.size() > 0){
                this.cncId = datas.get(0).get("cnc_id").toString();
                this.machineTypeId = datas.get(0).get("machine_type_id").toString();
                this.codes = new HashMap<String, String>();
                this.codeDescs = new HashMap<String, String>();
                for(Map data:datas){
                    if(data.containsKey("alarm_status") && (data.get("alarm_status") != null)){
                        this.codes.put(data.get("alarm_id").toString(), data.get("alarm_status").toString());
                    }else{
                        this.codes.put(data.get("alarm_id").toString(), "");
                    }
                    if(data.containsKey("description") && (data.get("description") != null)){
                        this.codeDescs.put(data.get("alarm_id").toString(), data.get("description").toString());
                    }else{
                        this.codeDescs.put(data.get("alarm_id").toString(), "");
                    }
                }
            }
        }

        public String getCncId() {
            return cncId;
        }

        public void setCncId(String cncId) {
            this.cncId = cncId;
        }

        public Map<String, String> getCodes() {
            return codes;
        }

        public void setCodes(Map<String, String> codes) {
            this.codes = codes;
        }

        public String getMachineTypeId() {
            return machineTypeId;
        }

        public void setMachineTypeId(String machineTypeId) {
            this.machineTypeId = machineTypeId;
        }

        public Map<String, String> getCodeDescs() {
            return codeDescs;
        }

        public void setCodeDescs(Map<String, String> codeDescs) {
            this.codeDescs = codeDescs;
        }
    }
}

