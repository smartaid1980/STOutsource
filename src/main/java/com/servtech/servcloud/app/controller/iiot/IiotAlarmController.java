package com.servtech.servcloud.app.controller.iiot;

import com.servtech.servcloud.app.model.iiot.IiotMachineAlarmLog;
import com.servtech.servcloud.app.model.iiot.IiotWatchPushLog;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

/**
 * Created by Frank on 2018/10/15.
 */
@RestController
@RequestMapping("/iiot/alarm")
public class IiotAlarmController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(IiotAlarmController.class);
    SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                IiotMachineAlarmLog iiotMachineAlarmLog = new IiotMachineAlarmLog();
                iiotMachineAlarmLog.fromMap(data);

                if (iiotMachineAlarmLog.saveIt()) {
                    return success("update success");
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }


    @RequestMapping(value = "/getHistory", method = RequestMethod.POST)
    public RequestResult<?> getHistory(@RequestBody final Map data) {
        final String alarmStartDate = data.get("alarm_start_date").toString();
        final String alarmEndDate = data.get("alarm_end_date").toString();
        final List<String> machines = (List<String>) data.get("machines");


        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_machine_alarm_log ");
                sb.append("WHERE machine_id IN " + splitStrForSql(",", machines));
                sb.append("AND ");
                sb.append("alarm_type <> '3' ");
                sb.append("AND ");
                sb.append("(");

                sb.append("((alarm_start_time BETWEEN ");
                sb.append("'" + alarmStartDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + alarmEndDate + " 23:59:59' ) ");
                sb.append("AND ");
                sb.append("(alarm_end_time BETWEEN ");
                sb.append("'" + alarmStartDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + alarmEndDate + " 23:59:59' )) ");

                sb.append("OR ");

                sb.append("(alarm_start_time BETWEEN ");
                sb.append("'" + alarmStartDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + alarmEndDate + " 23:59:59' ) ");

                sb.append(")");
                List<Map> result = IiotMachineAlarmLog.findBySQL(sb.toString()).toMaps();
                for (Map data : result) {
                    data.put("alarm_start_time", datetimeFormat.format(data.get("alarm_start_time")));
                    data.put("alarm_end_time", data.get("alarm_end_time") == null ? null: datetimeFormat.format(data.get("alarm_end_time")));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/getTriggerList", method = RequestMethod.POST)
    public RequestResult<?> getTriggerList(@RequestBody final Map data) {
        final String alarmStartDate = data.get("alarm_start_date").toString();
        final String alarmEndDate = data.get("alarm_end_date") == null ? "" : data.get("alarm_end_date").toString() ;
        final String machineId = data.get("machine_id").toString();
        final String alarmCode = data.get("alarm_code").toString();

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_watch_push_log ");
                sb.append("WHERE machine_id = '" + machineId + "' ");
                sb.append("AND ");
                sb.append("alarm_end_time IS NOT NULL ");
                sb.append("AND ");
                sb.append("alarm_code = '" + alarmCode + "' ");
                sb.append("AND ");
                sb.append("alarm_log_id = '" + alarmStartDate + "' ");

                if (!"".equals(alarmEndDate) && !alarmEndDate.equals("null")) {
                    sb.append("AND ");
                    sb.append("(alarm_push_time BETWEEN ");
                    sb.append("'" + alarmStartDate +  "' ");
                    sb.append("AND ");
                    sb.append("'" + alarmEndDate + "' ) ");
                } else {
                    sb.append("AND ");
                    sb.append("alarm_push_time > '" + alarmStartDate + "'");
                }

                List<Map> result = IiotWatchPushLog.findBySQL(sb.toString()).toMaps();
                for (Map data : result) {
                    data.put("alarm_start_time", datetimeFormat.format(data.get("alarm_start_time")));
                    data.put("alarm_end_time", data.get("alarm_end_time") == null ? null: datetimeFormat.format(data.get("alarm_end_time")));
                    data.put("alarm_push_time", datetimeFormat.format(data.get("alarm_push_time")));
                }
                return success(result);
            }
        });
    }


    String splitStrForSql(String splitter, List<String> list) {
        String sep = "";
        StringBuilder sb = new StringBuilder("( ");

        for (String s : list) {
            sb.append(sep);
            sb.append("'" + s + "'");
            sep = splitter;
        }
        sb.append(" ) ");

        return sb.toString();
    }

    static class SQLTime {
        static SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");

        public static String toString (Object o) {
            return sdf.format(o);
        }

        public static Date getTime (String s) {
            Date date = null;
            try {
                date = sdf.parse(s);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return date;
        }
    }
}
