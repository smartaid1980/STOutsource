package com.servtech.servcloud.app.controller.alarm_clear;

import com.servtech.servcloud.app.model.alarm_clear.AlarmClearStep;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;

import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.DbMaxIndex;
import com.servtech.servcloud.module.util.CRUD_TYPE;
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
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2016/5/6.
 */

@RestController
@RequestMapping("/alarmclear/step")
public class AlarmClearStepController {
    private static final Logger log = LoggerFactory.getLogger(AlarmClearStepController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/readByCncIdAndAlarmId", method = GET)
    public RequestResult<List<Map>> readByCncIdAndAlarmId(
            @RequestParam("cncId") final String cncId,
            @RequestParam("alarmId") final String alarmId,
            @RequestParam("machineTypeId") final String machineTypeId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(AlarmClearStep.where("cnc_id = ? AND alarm_id = ? AND machine_type_id = ?", cncId, alarmId, machineTypeId).toMaps());
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("create_time", new Timestamp(System.currentTimeMillis()));
        return autoCreatePkAndInserOrUpdateData(data, CRUD_TYPE.CREATE);
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
        return autoCreatePkAndInserOrUpdateData(data, CRUD_TYPE.UPDATE);
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = AlarmClearStep.delete("step_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/readDetailByCncIdAndAlarmId", method = GET)
    public RequestResult<List<Map>> readDetailByCncIdAndAlarmId(
            @RequestParam("cncId") final String cncId,
            @RequestParam("alarmId") final String alarmId,
            @RequestParam("machineTypeId") final String machineTypeId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Base.findAll(
                        "SELECT acs.step_id, acs.alarm_id, acs.cnc_id, acs.machine_type_id, acs.seq, acs.type, acs.step_desc, acs.clear_desc, acs.detect_rules," +
                                "   acf1.file_id AS file_id_1, acf2.file_id AS file_id_2, acf3.file_id AS file_id_3," +
                                "   acf1.file_desc AS file_desc_1, acf2.file_desc AS file_desc_2, acf3.file_desc AS file_desc_3," +
                                "   acf1.file_path AS file_path_1, acf2.file_path AS file_path_2, acf3.file_path AS file_path_3" +
                                " FROM a_alarm_clear_step acs" +
                                "   LEFT JOIN a_alarm_clear_file acf1 ON acs.file_id_1 = acf1.file_id" +
                                "   LEFT JOIN a_alarm_clear_file acf2 ON acs.file_id_2 = acf2.file_id" +
                                "   LEFT JOIN a_alarm_clear_file acf3 ON acs.file_id_3 = acf3.file_id" +
                                " WHERE acs.cnc_id = ? AND acs.alarm_id = ? AND acs.machine_type_id = ?" +
                                " ORDER BY acs.seq ASC", cncId, alarmId, machineTypeId));
            }
        });
    }

    private RequestResult<String> autoCreatePkAndInserOrUpdateData(final Map data, final CRUD_TYPE crudType){
        return autoCreatePkAndInserOrUpdateData(data, crudType, 1);//第一次要設定db add index初始值
    }

    private RequestResult<String> autoCreatePkAndInserOrUpdateData(final Map data, final CRUD_TYPE crudType, final int dbAddIndex){
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    AlarmClearStep alarmClearStep = new AlarmClearStep();
                    switch(crudType){
                        case CREATE:
                            DbMaxIndex dbMaxIndex = DbMaxIndex.findById("a_alarm_clear_step");
                            if(dbMaxIndex == null){
                                return fail("db_max_index not find pk 'a_alarm_clear_step'");
                            }
                            int nextIndex = dbMaxIndex.getInteger("max_index") + dbAddIndex;
                            log.info("***** : {}", nextIndex);
                            log.info("step_id : {}", String.format("%010d", nextIndex));
                            data.put("step_id", String.format("%010d", nextIndex));
                            alarmClearStep.fromMap(data);
                            if (alarmClearStep.insert()) {//新增需要更新max_index
                                DbMaxIndex updateDbMaxIndex = DbMaxIndex.findById("a_alarm_clear_step");
                                updateDbMaxIndex.set("max_index", nextIndex);//更新index
                                updateDbMaxIndex.saveIt();
                                return success(alarmClearStep.getString("step_id"));
                            } else {
                                return fail("create fail...");
                            }
                        case UPDATE:
                            alarmClearStep.fromMap(data);
                            if (alarmClearStep.saveIt()) {
                                return success(alarmClearStep.getString("step_id"));
                            }else{
                                return fail("update fail...");
                            }
                        default:
                            log.warn("*** can not exec this type op: {}", crudType);
                            return fail("can not exec this type op: " + crudType);
                    }
                }
            });
        } catch (Exception e) {
            //很衰小的遇到pk重複，找好再做一次取號
            if(e.getMessage().contains("PRIMARY") && e.getMessage().contains("Duplicate")){
                log.info("a_alarm_clear_step Duplicate PRIMARY, so pk index + {}", dbAddIndex + 1);
                return autoCreatePkAndInserOrUpdateData(data, crudType, dbAddIndex + 1);//摸一該
            }else{
                log.error(e.getMessage());
                return fail("exception: " + e.getMessage());
            }
        }
    }
}
