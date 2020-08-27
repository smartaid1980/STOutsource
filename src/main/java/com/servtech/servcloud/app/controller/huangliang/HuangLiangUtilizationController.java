package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.UtilizationNotify;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Hubert
 * Datetime: 2016/9/1 上午 10:32
 */
@RestController
@RequestMapping("/huangliang/utilization")
public class HuangLiangUtilizationController {

    @RequestMapping(value = "getByMachineId", method = RequestMethod.GET)
    public RequestResult<List<Record>> getByMachineId(@RequestParam(value="count") final int count, @RequestParam(value="machineId") final String machineId, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<UtilizationNotify> utilizationNotifies = UtilizationNotify.where("machine_id = '" + machineId + "' AND group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                        .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (UtilizationNotify utilizationNotify : utilizationNotifies) {
                    Record record = new Record();
                    record.datetime = utilizationNotify.getString("notify_time");
                    record.machineId = utilizationNotify.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.produceEfficiency = String.format("%.1f", utilizationNotify.getDouble("production_eff"));
                    record.qualityUtilization = String.format("%.1f", utilizationNotify.getDouble("quality_eff"));
                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "get", method = RequestMethod.GET)
    public RequestResult<List<Record>> getReapirRecord(@RequestParam(value="count") final int count, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<UtilizationNotify> utilizationNotifies = UtilizationNotify.where("group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                                                                            .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (UtilizationNotify utilizationNotify : utilizationNotifies) {
                    Record record = new Record();
                    record.datetime = utilizationNotify.getString("notify_time");
                    record.machineId = utilizationNotify.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.produceEfficiency = String.format("%.1f", utilizationNotify.getDouble("production_eff"));
                    record.qualityUtilization = String.format("%.1f", utilizationNotify.getDouble("quality_eff"));
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
//            notifyRecord.datetime = "2016/09/01 10:41:54";
//            notifyRecord.machineId = "ma1001";
//            notifyRecord.machineName = "MA-1001";
//            notifyRecord.produceEfficiency = "67.5";
//            notifyRecord.qualityUtilization = "87.6";
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
                UtilizationNotify utilizationNotify = new UtilizationNotify();
                utilizationNotify.fromMap(notifyRecord);

                if (utilizationNotify.insert()) {
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("囧");
                }
            }
        });
    }

    public static class Record {
        public String datetime;
        public String machineId;
        public String machineName;
        public String produceEfficiency;
        public String qualityUtilization;
    }
}
