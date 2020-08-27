package com.servtech.servcloud.app.controller.aplus;

import com.servtech.servcloud.app.model.aplus.AAplusDetectionRule;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("/aplus/alarmlog")
public class AlarmLogController {
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/getAlarmLogByMachineIdAndAlarmId", method = POST)
    public RequestResult<?> getAlarmLogByMachineIdAndAlarmId(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String machineId = data.get("machineId").toString();
                String alarmId = data.get("alarmId").toString();
                String startTime = data.get("startTime").toString().replace("/", "-");
                String endTime = data.get("endTime").toString().replace("/", "-");

                String alarmIdStr = "";
                if(!alarmId.isEmpty()){
                    alarmIdStr = " AND aaal.alarm_id = '" + alarmId + "'";
                }
                String selectMachine = " AND aaal.machine_id = '" + machineId + "' ";
                if(machineId.equals("ALL")){
                    selectMachine = "";
                }
                List<Map> results;
                if(startTime.isEmpty() || endTime.isEmpty()){
                    //只取最新一筆
                    results = Base.findAll("SELECT aadr.type_id, aaal.machine_id, aaal.alarm_id, aadr.title as name, aaal.detection_result, aaal.create_time" +
                            " FROM a_aplus_alarm_log aaal, a_aplus_detection_rule aadr" +
                            " WHERE aaal.machine_id = aadr.machine_id AND aaal.alarm_id = aadr.alarm_id" +
                            selectMachine + alarmIdStr + " ORDER BY aaal.create_time DESC LIMIT 1");
                }else{
                    results = Base.findAll("SELECT aadr.type_id, aaal.machine_id, aaal.alarm_id, aadr.title as name, aaal.detection_result, aaal.create_time" +
                            " FROM a_aplus_alarm_log aaal, a_aplus_detection_rule aadr" +
                            " WHERE aaal.machine_id = aadr.machine_id AND aaal.alarm_id = aadr.alarm_id" +
                            selectMachine + alarmIdStr + " AND aaal.create_time BETWEEN ? and ? ORDER BY aaal.create_time DESC", startTime, endTime);
                }
                return success(results);
            }
        });
    }
}
