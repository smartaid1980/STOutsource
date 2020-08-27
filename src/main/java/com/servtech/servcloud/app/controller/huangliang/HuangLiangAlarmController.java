package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.servcloud.app.model.huangliang.NotifyDelay;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert
 * Datetime: 2016/7/21 上午 10:21
 */
@RestController
@RequestMapping("/huangliang/alarm")
public class HuangLiangAlarmController {

    private static final Logger LOG = LoggerFactory.getLogger(HuangLiangAlarmController.class);

    @RequestMapping(value = "getByMachineId", method = GET)
    public RequestResult<List<Record>> getByMachineId(@RequestParam(value="count") final int count, @RequestParam(value="machineId") final String machineId, HttpServletRequest request) {
        final String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Map<String, String> employeeTable = getEmployees();

        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<NotifyDelay> notifyDelays = NotifyDelay.where("machine_id = '" + machineId + "' AND group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                        .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (NotifyDelay notifyDelay : notifyDelays) {
                    Record record = new Record();
                    record.datetime = notifyDelay.getString("alarm_time");
                    record.notifyTime = notifyDelay.getString("notify_time");
                    record.machineId = notifyDelay.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.careEmpId = notifyDelay.getString("care_emp_id");

                    for (int i = 5 - record.careEmpId.length(); i > 0; i--) {
                        record.careEmpId = "0" + record.careEmpId;
                    }


                    record.careEmpName = employeeTable.containsKey(record.careEmpId) ? employeeTable.get(record.careEmpId) : "---";

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
        final Map<String, String> employeeTable = getEmployees();

        List<Record> result = ActiveJdbc.oper(new Operation<List<Record>>() {
            @Override
            public List<Record> operate() {
                SysUser sysUser = SysUser.findFirst("user_id = ?", userId);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                Object[] userGroups = new Object[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                List<NotifyDelay> notifyDelays = NotifyDelay.where("group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                                                            .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (NotifyDelay notifyDelay : notifyDelays) {
                    Record record = new Record();
                    record.datetime = notifyDelay.getString("alarm_time");
                    record.notifyTime = notifyDelay.getString("notify_time");
                    record.machineId = notifyDelay.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.careEmpId = notifyDelay.getString("care_emp_id");

                    for (int i = 5 - record.careEmpId.length(); i > 0; i--) {
                        record.careEmpId = "0" + record.careEmpId;
                    }


                    record.careEmpName = employeeTable.containsKey(record.careEmpId) ? employeeTable.get(record.careEmpId) : "---";

                    result.add(record);
                }

                return result;
            }
        });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "notify", method = POST)
    public RequestResult<String> notify(@RequestBody final Map notifyRecord) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                NotifyDelay notifyDelay = new NotifyDelay();
                notifyDelay.fromMap(notifyRecord);

                if (notifyDelay.insert()) {
                    return success();
                } else {
                    return fail("囧");
                }
            }
        });
    }

    public static class Record {
        public String datetime;
        public String notifyTime;
        public String machineId;
        public String machineName;
        public String careEmpId;
        public String careEmpName;
    }

    static Map<String, String> getEmployees() {
        Hippo hippo = HippoService.getInstance();
        SimpleExhaler exhaler = hippo.newSimpleExhaler();
        Map<String, String> result = new HashMap<String, String>();

        Future<SimpleExhalable> future = exhaler.space("HUL_care_employees")
                                                .index("customer_id", new String[]{"HuangLiang"})
                                                .columns("employee_id", "employee_name")
                                                .exhale();
        try {
            SimpleExhalable exhalable = future.get();
            List<Map<String, Atom>> emps = exhalable.toMapping();
            for (Map<String, Atom> emp : emps) {
                result.put(emp.get("employee_id").asString(), emp.get("employee_name").asString());
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
