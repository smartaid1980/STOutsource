package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.RegulateNotifyLog;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Jenny
 * Datetime: 2018/11/27 下午 16:53
 */
@RestController
@RequestMapping("/huangliang/regulatenotify")
public class HuangLiangRegulateNotifyController {

    private static final Logger LOG = LoggerFactory.getLogger(HuangLiangRegulateNotifyController.class);

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

                List<RegulateNotifyLog> regulateNotifyLogs = RegulateNotifyLog.where("machine_id = '" + machineId + "' AND group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                        .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (RegulateNotifyLog regulateNotifyLog : regulateNotifyLogs) {
                    Record record = new Record();
                    record.last100Time = regulateNotifyLog.getString("last_100_time");
                    record.notifyTime = regulateNotifyLog.getString("notify_time");
                    record.machineId = regulateNotifyLog.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "get", method = GET)
    public RequestResult<List<Record>> getAlarmRecord(@RequestParam(value="count") final int count, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<RegulateNotifyLog> regulateNotifyLogs = RegulateNotifyLog.where("group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                                                            .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (RegulateNotifyLog regulateNotifyLog : regulateNotifyLogs) {
                    Record record = new Record();
                    record.last100Time = regulateNotifyLog.getString("last_100_time");
                    record.notifyTime = regulateNotifyLog.getString("notify_time");
                    record.machineId = regulateNotifyLog.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "notify", method = POST)
    public RequestResult<String> notify(@RequestBody final Map notifyParam) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RegulateNotifyLog regulateNotifyLog = new RegulateNotifyLog();
                regulateNotifyLog.fromMap(notifyParam);

                if (regulateNotifyLog.insert()) {
                    return success();
                } else {
                    return fail("囧");
                }
            }
        });
    }

    public static class Record {
        public String notifyTime;
        public String machineId;
        public String machineName;
        public String last100Time;
    }
}
