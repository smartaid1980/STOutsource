package com.servtech.servcloud.app.controller.alarm_clear;

import com.servtech.servcloud.app.model.alarm_clear.AlarmClearLog;
import com.servtech.servcloud.app.model.alarm_clear.AlarmClearStep;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
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
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Kevin Big Big on 2016/5/13.
 */

@RestController
@RequestMapping("/alarmclear/log")
public class AlarmClearLogController {
    private static final Logger log = LoggerFactory.getLogger(AlarmClearLogController.class);

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

                    AlarmClearLog alarmClearLog = new AlarmClearLog();
                    alarmClearLog.fromMap(data);
                    if (alarmClearLog.insert()) {
                        return success(alarmClearLog.getString("clear_log_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readByAlarmLogId", method = GET)
    public RequestResult<List<Map>> readByAlarmLogId(
            @RequestParam("alarmLogId") final String alarmLogId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT acl.*, acs.alarm_id,  acs.cnc_id, acs.seq, acs.type, acs.step_desc, acs.clear_desc" +
                                " FROM a_alarm_clear_log acl, a_alarm_clear_step acs" +
                                " WHERE acl.alarm_log_id = ? AND acl.step_id = acs.step_id" +
                                " ORDER BY acl.clear_log_id ASC", alarmLogId);
                return success(result);
                //return success(AlarmClearLog.where("alarm_log_id = ? AND step_id = ?", alarmLogId, stepId).orderBy("").toMaps());
            }
        });
    }
}
