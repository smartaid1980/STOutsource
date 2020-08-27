package com.servtech.servcloud.app.controller.monitor;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2016/5/9.
 */

@RestController
@RequestMapping("/monitor/cycu")
public class MonitorController {
    private static final Logger log = LoggerFactory.getLogger(MonitorController.class);
    private static final String NOT_VALUE = "---";
    private static final String NOT_DIAGNOSE = "0";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/readCycuMonitors", method = GET)
    public RequestResult<List<Map>> readCycuMonitors() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = new ArrayList<Map>();
                List<Map> deivceInfos = Base.findAll("SELECT d.device_id, db.box_id, dcb.cnc_id FROM m_device d" +
                        " LEFT JOIN m_device_box db ON d.device_id = db.device_id" +
                        " LEFT JOIN m_device_cnc_brand dcb ON d.device_id = dcb.device_id");
                List<Map> cycuMonitors = Base.findAll("Select * FROM a_monitor_cycu");
                Map<String, Map> cycuMonitorMap = new HashMap<String, Map>();
                for(Map cycuMonitor:cycuMonitors){
                    cycuMonitorMap.put(cycuMonitor.get("device_id").toString(), cycuMonitor);
                }
                for(Map deviceInfo:deivceInfos){
                    Map tempMap;
                    String deviceId = deviceInfo.get("device_id").toString();
                    if(cycuMonitorMap.containsKey(deviceId)){//cycu monitor有
                        tempMap = cycuMonitorMap.get(deviceId);
                        tempMap.put("time_of_occurrence", yyyyMMddHHmmss((Date) tempMap.get("time_of_occurrence")));//日期轉字串
                        tempMap.put("cnc_id", NOT_VALUE);
                    }else{
                        tempMap = new HashMap();
                        tempMap.put("device_id", deviceId);
                        tempMap.put("box_id", NOT_VALUE);
                        tempMap.put("diagnose", NOT_DIAGNOSE);
                        tempMap.put("diagnose_detail", NOT_VALUE);
                        tempMap.put("diagnose_status", NOT_VALUE);
                        tempMap.put("time_of_occurrence", NOT_VALUE);
                        tempMap.put("cnc_id", NOT_VALUE);
                    }
                    if(deviceInfo.containsKey("box_id") && (deviceInfo.get("box_id") != null)){//平台有綁，就用平台的
                        tempMap.put("box_id", deviceInfo.get("box_id"));
                    }
                    if(deviceInfo.containsKey("cnc_id") && (deviceInfo.get("cnc_id") != null)){//平台有綁，就用平台的
                        tempMap.put("cnc_id", deviceInfo.get("cnc_id"));
                    }
                    result.add(tempMap);
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/createHistory", method = POST)
    public RequestResult<Integer> createHistory(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<Integer>>() {
            @Override
            public RequestResult<Integer> operate() {
                int result = Base.exec("INSERT INTO a_monitor_cycu_history (device_id, change_time, type, current_status, pre_status)" +
                        " VALUES (?, ?, ?, ?, ?)", data.get("device_id"), data.get("change_time"), data.get("type"), data.get("current_status"), data.get("pre_status"));
                if (result > 0) {
                    return success(result);
                } else {
                    return fail(result);
                }
            }
        });
    }

    @RequestMapping(value = "/updateMonitor", method = POST)
    public RequestResult<Integer> updateMonitor(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<Integer>>() {
            @Override
            public RequestResult<Integer> operate() {
                List<Map> records = Base.findAll("SELECT mc.device_id FROM a_monitor_cycu mc WHERE mc.device_id = ?", data.get("device_id"));
                if(records.size() > 0){//update
                    log.info("update cycu monitor...");
                    int result = Base.exec("UPDATE a_monitor_cycu SET box_id = ?, diagnose = ?, diagnose_status = ?, time_of_occurrence = ?" +
                                    " WHERE device_id = ?",
                            data.get("box_id"), data.get("diagnose"), data.get("diagnose_status"), data.get("time_of_occurrence"), data.get("device_id"));
                    if (result > 0) {
                        return success(result);
                    } else {
                        return fail(result);
                    }
                }else{//insert
                    log.info("insert cycu monitor...");
                    int result = Base.exec("INSERT INTO a_monitor_cycu (device_id, box_id, diagnose, diagnose_status, time_of_occurrence)" +
                            " VALUES (?, ?, ?, ?, ?)", data.get("device_id"), data.get("box_id"), data.get("diagnose"), data.get("diagnose_status"), data.get("time_of_occurrence"));
                    if (result > 0) {
                        return success(result);
                    } else {
                        return fail(result);
                    }
                }
            }
        });
    }

    private String yyyyMMddHHmmss(Date date){
        SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss");
        return format.format(date);
    }
}