package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.Undispatch;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Alarm;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Hubert
 * Datetime: 2016/7/21 上午 10:22
 */
@RestController
@RequestMapping("/huangliang/undispatch")
public class HuangLiangUndispatchController {
    @RequestMapping(value = "getByMachineId", method = GET)
    public RequestResult<List<Record>> getByMachineId(@RequestParam(value="count") final int count, @RequestParam(value="machineId") final String machineId, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<Undispatch> undispatches = Undispatch.where("machine_id = '" + machineId + "' AND group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                        .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (Undispatch undispatch : undispatches) {
                    Record record = new Record();
                    record.datetime = undispatch.getString("alarm_time");
                    record.notifyTime = undispatch.getString("notify_time");
                    record.machineId = undispatch.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.alarmCode = undispatch.getString("alarm_code");
                    String alarmNote = "";
                    String sep = "";
                    for (String eachAlarmCode : record.alarmCode.split(",")) {
                        Alarm alarm = Alarm.first("alarm_id = ?", eachAlarmCode);
                        String note = alarm != null ? alarm.getString("alarm_status") : "";
                        alarmNote += sep + note;
                        sep = "|";
                    }
                    record.alarmNote = alarmNote;
                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "get", method = GET)
    public RequestResult<List<Record>> getReapirRecord(@RequestParam(value="count") final int count, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<Undispatch> undispatches = Undispatch.where("group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                                                          .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (Undispatch undispatch : undispatches) {
                    Record record = new Record();
                    record.datetime = undispatch.getString("alarm_time");
                    record.notifyTime = undispatch.getString("notify_time");
                    record.machineId = undispatch.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.alarmCode = undispatch.getString("alarm_code");
                    String alarmNote = "";
                    String sep = "";
                    for (String eachAlarmCode : record.alarmCode.split(",")) {
                        Alarm alarm = Alarm.first("alarm_id = ?", eachAlarmCode);
                        String note = alarm != null ? alarm.getString("alarm_status") : "";
                        alarmNote += sep + note;
                        sep = "|";
                    }
                    record.alarmNote = alarmNote;
                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);

//        List<Record> result = new ArrayList<Record>();
//
//        for (int i = 0; i < count; i++) {
//            Record notifyRecord = new Record();
//            notifyRecord.datetime = "2016/07/21 10:41:54";
//            notifyRecord.machineId = "ma1001";
//            notifyRecord.machineName = "MA-1001";
//            notifyRecord.alarmCode = "1001";
//            notifyRecord.alarmNote = "不夠油，請上油";
//            result.add(notifyRecord);
//        }
//
//        return RequestResult.success(result);
    }

    @RequestMapping(value = "notify", method = POST)
    public RequestResult<String> notify(@RequestBody final Map notifyRecord) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Undispatch undispatch = new Undispatch();
                undispatch.fromMap(notifyRecord);

                if (undispatch.insert()) {
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("囧");
                }
            }
        });
    }

    public static class Record {
        public String datetime;
        public String notifyTime;
        public String machineId;
        public String machineName;
        public String alarmCode;
        public String alarmNote;
    }
}
