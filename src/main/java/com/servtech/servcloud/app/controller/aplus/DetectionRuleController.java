package com.servtech.servcloud.app.controller.aplus;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.alarm_clear.AlarmClearLog;
import com.servtech.servcloud.app.model.aplus.AAplusDetectionRule;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("/aplus/detectionrule")
public class DetectionRuleController {
    private static final Logger log = LoggerFactory.getLogger(DetectionRuleController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("type_id", Integer.parseInt(data.get("type_id").toString()));
                    //log.info("create: {}", new Gson().toJson(data));

                    AAplusDetectionRule aAplusDetectionRule = new AAplusDetectionRule();
                    aAplusDetectionRule.fromMap(data);
                    if (aAplusDetectionRule.insert()) {
                        return success(aAplusDetectionRule.getString("alarm_id") + "," +
                                aAplusDetectionRule.getString("machine_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = POST)
    public RequestResult<String> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    data.put("type_id", Integer.parseInt(data.get("type_id").toString()));
                    //log.info("create: {}", new Gson().toJson(data));

                    AAplusDetectionRule aAplusDetectionRule = new AAplusDetectionRule();
                    aAplusDetectionRule.fromMap(data);
                    if (aAplusDetectionRule.saveIt()) {
                        return success(aAplusDetectionRule.getString("alarm_id") + "," +
                                aAplusDetectionRule.getString("machine_id"));
                    } else {
                        return fail("更新失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = POST)
    public RequestResult<List<Map>> read(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String machineId = data.get("machine_id").toString();
                String typeId = "";
                if(data.containsKey("type_id") && data.get("type_id") != null){
                    typeId = data.get("type_id").toString();
                }
                String alarmId = data.get("alarm_id").toString();
                String alarmName = data.get("alarm_name").toString();
                log.info("machineId: {}, typeId: {}, alarmId: {}, alarmName: {}", machineId, typeId, alarmId, alarmName);

                String selectMachine = " AND aadr.machine_id = '" + machineId + "'";
                if(machineId.equals("ALL")){
                    selectMachine = "";
                }
                String query = "SELECT aadt.type_name, aadr.alarm_id, aadr.machine_id, aadr.type_id," +
                        " aadr.title, aadr._desc, aadr._condition, aadr.condition_rule," +
                        " aadr.condition_valid, aadr.detect, aadr.detect_rule, aadr.is_valid" +
                        " FROM a_aplus_detection_rule aadr, a_aplus_detection_type aadt" +
                        " WHERE aadr.type_id = aadt.type_id AND aadr.machine_id = aadt.machine_id" +
                        selectMachine;
                //boolean typeIdIsEmpty = true;
                if(!typeId.isEmpty()){
                    query = query + " AND aadr.type_id = '" + typeId + "'";
                    //typeIdIsEmpty = false;
                }

                if(!alarmId.isEmpty() && !alarmName.isEmpty()){
                    query = query + " AND (aadr.alarm_id = '" + alarmId + "' OR aadr.title = '" + alarmName + "')";
                }else if(!alarmId.isEmpty()){
                    query = query + " AND aadr.alarm_id = '" + alarmId + "'";
                //}else if(!alarmName.isEmpty() || typeIdIsEmpty){
                }else if(!alarmName.isEmpty()){
                    query = query + " AND aadr.title = '" + alarmName + "'";
                }
                log.info("query: {}", query);
                List<Map> result = Base.findAll(query);
                return success(result);
            }});
    }

    @RequestMapping(value = "/delete", method = POST)
    public RequestResult<String> delete(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    int deleteAmount = AAplusDetectionRule.delete("alarm_id = ? AND machine_id = ?",
                            data.get("alarm_id"), data.get("machine_id"));
                    return success();
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
}
