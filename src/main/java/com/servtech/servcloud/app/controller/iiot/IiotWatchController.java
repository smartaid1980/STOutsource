package com.servtech.servcloud.app.controller.iiot;

import com.servtech.servcloud.app.model.iiot.IiotMachineAlarmLog;
import com.servtech.servcloud.app.model.iiot.IiotWatchPushLog;
import com.servtech.servcloud.app.model.iiot.view.IiotWatchDeptMachineView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Device;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/10/15.
 */
@RestController
@RequestMapping("/iiot/watch")
public class IiotWatchController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(IiotWatchController.class);
    SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/updateRegisterInfo", method = RequestMethod.POST)
    public RequestResult<?> updateRegisterInfo(@RequestBody final Map data) {
        final String watchId = data.get("watch_id").toString();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                List<Map> devices = Device.findAll().toMaps();
                Map<String, String> machineId2Name = new HashMap();
                for (Map device : devices) {
                    String deviceId = device.get("device_id").toString();
                    String deviceName = device.get("device_name").toString();
                    machineId2Name.put(deviceId, deviceName);
                }

                List<Map> watchInfo = IiotWatchDeptMachineView.find("watch_id = ? AND is_alarm_open = 'Y'", watchId).toMaps();
                List<String> machineNames = new ArrayList<String>();
                List<String> machineIds = new ArrayList<String>();
                Map result = new HashMap();

                if (watchInfo.size() > 0) {

                    for (Map map : watchInfo) {
                        String machineId = map.get("machine_id").toString();
                        machineNames.add(machineId2Name.get(machineId));
                        machineIds.add(machineId);
                    }

                    result.put("dept_id", watchInfo.get(0).get("dept_id").toString());
                    result.put("watch_name", watchInfo.get(0).get("watch_name").toString());
                    result.put("dept_name", watchInfo.get(0).get("dept_name").toString());
                    result.put("machine_id", machineIds);
                    result.put("machine_name", machineNames);
                }

                return success(result);
            }
        });
    }

    @RequestMapping(value = "/getAlarmStatus", method = RequestMethod.POST)
    public RequestResult<?> getAlarmStatus(@RequestBody final Map data) {
        final String watchId = data.get("watch_id").toString();
        final String triggerPush = data.get("trigger_push") == null ? "" : data.get("trigger_push").toString();
        final Timestamp currentTime = new Timestamp(System.currentTimeMillis());
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                try {
                    List<Map> devices = Device.findAll().toMaps();
                    Map<String, String> machineId2Name = new HashMap();
                    for (Map device : devices) {
                        String deviceId = device.get("device_id").toString();
                        String deviceName = device.get("device_name").toString();
                        machineId2Name.put(deviceId, deviceName);
                    }

                    List<Map> watchInfo = IiotWatchDeptMachineView.find("watch_id = ? AND watch_is_open = 'Y' AND dept_is_open = 'Y' AND is_alarm_open = 'Y'", watchId).toMaps();
                    if (watchInfo.size() == 0) {
                        return success(new ArrayList<Map>());
                    }
                    List<String> machines = new ArrayList<String>();
                    for (Map map : watchInfo) {
                        machines.add(map.get("machine_id").toString());
                    }

                    StringBuilder sql = new StringBuilder();
                    sql.append("SELECT  a.* ");
                    sql.append("FROM a_iiot_machine_alarm_log a ");
                    sql.append("INNER JOIN( SELECT  machine_id, MAX(alarm_start_time) AS maxdate FROM a_iiot_machine_alarm_log GROUP BY machine_id) b ");
                    sql.append("ON a.machine_id = b.machine_id ");
                    sql.append("AND a.alarm_start_time = b.maxdate ");
                    sql.append("WHERE a.machine_id IN " + splitStrForSql(",", machines));
                    sql.append("AND alarm_type <> '3' ");
                    sql.append("AND alarm_end_time IS NULL ");

                    List<Map> queryResult = IiotMachineAlarmLog.findBySQL(sql.toString()).toMaps();

                    IiotWatchPushLog iiotWatchPushLog = new IiotWatchPushLog();
                    Map data = new HashMap();

                    for (Map map : queryResult) {
                        String alarmLogId = map.get("alarm_log_id").toString();
                        data.put("alarm_push_time", currentTime);
                        data.put("alarm_log_id", alarmLogId);
                        data.put("alarm_start_time", map.get("alarm_start_time").toString());
                        data.put("alarm_end_time", triggerPush.equals("true") ? currentTime : null);
                        data.put("machine_id", map.get("machine_id").toString());
                        data.put("alarm_code", map.get("alarm_code").toString());
                        data.put("watch_id", watchId);

                        iiotWatchPushLog.fromMap(data);
                        if (iiotWatchPushLog.insert()) {
                            log.info(alarmLogId + " " + map.get("machine_id").toString() + "insert iiotWatchPushLog success!!!");
                        } else {
                            log.info(alarmLogId + " " + map.get("machine_id").toString() + "insert iiotWatchPushLog fail...");
                        }

                        String time = map.get("duration").toString();
                        map.put("duration", convertTime2Sec(time));
                        map.put("alarm_push_time", datetimeFormat.format(currentTime));
                        map.put("machine_id", machineId2Name.get(map.get("machine_id").toString()));
                    }
                    return success(queryResult);
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail("fail...");
                }
            }
        });
    }

    private List<Map> getPushNum(String alarmLogId, String watchId, String afterTime) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM a_iiot_watch_push_log ");
        sql.append("where alarm_log_id = '" + alarmLogId + "' ");
        sql.append("AND watch_id = '" + watchId + "' ");
        sql.append("AND alarm_push_time >= '" + afterTime + "' limit 0,1");
        List<Map> queryPushLog = IiotWatchPushLog.findBySQL(sql.toString()).toMaps();
        return queryPushLog;
    }

    private void insertPushLog(List<Map> pushNum, IiotWatchPushLog iiotWatchPushLog, Map data) {
        if (pushNum.size() == 0) {
            iiotWatchPushLog.fromMap(data);
            if (iiotWatchPushLog.insert()) {
                log.info("insert iiotWatchPushLog success!!!");
            } else {
                log.info("insert iiotWatchPushLog fail...");
            }
        }
    }

    @RequestMapping(value = "/getTriggerHistory", method = RequestMethod.POST)
    public RequestResult<?> getAlarmHistory(@RequestBody final Map data) {
        final String watchId = data.get("watch_id").toString();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> devices = Device.findAll().toMaps();
                Map<String, String> machineId2Name = new HashMap();
                for (Map device : devices) {
                    String deviceId = device.get("device_id").toString();
                    String deviceName = device.get("device_name").toString();
                    machineId2Name.put(deviceId, deviceName);
                }

                List<Map> watchInfo = IiotWatchDeptMachineView.find("watch_id = ? AND watch_is_open = 'Y' AND dept_is_open = 'Y' AND is_alarm_open = 'Y'", watchId).toMaps();
                List<String> machines = new ArrayList<String>();
                for (Map map : watchInfo) {
                    machines.add(map.get("machine_id").toString());
                }

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_machine_alarm_log ");
                sb.append("WHERE machine_id IN " + splitStrForSql(",", machines));
                sb.append("AND alarm_type <> '3' ");
                sb.append("ORDER BY alarm_end_time IS NULL DESC, alarm_start_time DESC LIMIT 50 ");

                List<Map> result = IiotMachineAlarmLog.findBySQL(sb.toString()).toMaps();
                for (Map map : result) {
                    map.put("machine_id", machineId2Name.get(map.get("machine_id").toString()));
                    map.put("alarm_start_time", datetimeFormat.format(map.get("alarm_start_time")));
                    map.put("alarm_end_time", map.get("alarm_end_time") == null ? null : datetimeFormat.format(map.get("alarm_end_time")));
                    map.put("duration", convertTime2Sec(map.get("duration").toString()));
                }
                return success(result);
            }
        });
    }


    String splitStrForSql(String splitter, List<String> list) {
        if (list.size() == 0) {
            String emptySqlSyntax = "('')";
            return emptySqlSyntax;
        }
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

    int convertTime2Sec(String time) {
        String[] units = time.split(":");
        int hours = Integer.parseInt(units[0]);
        int minutes = Integer.parseInt(units[1]);
        int seconds = Integer.parseInt(units[2]);
        int duration = hours * 60 * 60 + minutes * 60 + seconds;
        return duration;
    }

}
