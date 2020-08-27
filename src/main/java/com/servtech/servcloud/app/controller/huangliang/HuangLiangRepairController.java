package com.servtech.servcloud.app.controller.huangliang;

import com.google.common.io.Files;
import com.servtech.hippopotamus.*;
import com.servtech.servcloud.app.model.huangliang.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.module.service.hippo.HippoService;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.apache.commons.io.Charsets;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.LazyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;

import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert
 * Datetime: 2016/7/21 上午 10:21
 */
@RestController
@RequestMapping("/huangliang/repair")
public class HuangLiangRepairController {

    private static final Logger log = LoggerFactory.getLogger(HuangLiangRepairController.class);

    @Autowired
    private HttpServletRequest request;

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

                List<RepairDelay> repairDelays = RepairDelay.where("machine_id = '" + machineId + "' AND group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                        .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (RepairDelay repairDelay : repairDelays) {
                    Record record = new Record();
                    record.datetime = repairDelay.getString("alarm_time");
                    record.notifyTime = repairDelay.getString("notify_time");
                    record.machineId = repairDelay.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.repairEmpId = repairDelay.getString("repair_emp_id");
                    record.repairEmpName = SysUser.first("user_id = ?", record.repairEmpId).getString("user_name");
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

                List<RepairDelay> repairDelays = RepairDelay.where("group_id IN (" + Util.strSplitBy("?", ",", userGroups.length) + ")", userGroups)
                                                            .limit(count).orderBy("notify_time desc");

                List<Record> result = new ArrayList<Record>();
                for (RepairDelay repairDelay : repairDelays) {
                    Record record = new Record();
                    record.datetime = repairDelay.getString("alarm_time");
                    record.notifyTime = repairDelay.getString("notify_time");
                    record.machineId = repairDelay.getString("machine_id");
                    record.machineName = Device.first("device_id = ?", record.machineId).getString("device_name");
                    record.repairEmpId = repairDelay.getString("repair_emp_id");
                    record.repairEmpName = SysUser.first("user_id = ?", record.repairEmpId).getString("user_name");
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
//            notifyRecord.datetime = "2016/07/21 10:36:09";
//            notifyRecord.machineId = "ma1001";
//            notifyRecord.machineName = "MA-1001";
//            notifyRecord.repairEmpId = "b001";
//            notifyRecord.repairEmpName = "關雨";
//            result.add(notifyRecord);
//        }
//
//        return RequestResult.success(result);
    }

    @RequestMapping(value = "priority", method = GET)
    public RequestResult<List<Map>> priority() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = MachinePriority.findAll().toMaps();
                List<String> machineIdList = Device.findAll().collect("device_id");

                for (Map map : result) {
                    String existedMachineId = (String) map.get("machine_id");
                    machineIdList.remove(existedMachineId);
                }

                for (String machineId : machineIdList) {
                    Map map = new LinkedHashMap();
                    map.put("machine_id", machineId);
                    map.put("priority", 0);
                    result.add(map);
                }

                return RequestResult.success(result);
            }
        });
    }

    @RequestMapping(value = "machineInfo", method = GET)
    public RequestResult<String> machineProcess(@RequestParam(value = "machineId") final String machineId) {
        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                MachinePriority machinePriority = MachinePriority.findById(machineId);
                int priority = machinePriority == null ? 0 : machinePriority.getInteger("priority");
                String process = "1";

                try {
                    List<String> lines = Files.readLines(new File(System.getProperty(SysPropKey.DATA_PATH), "machine_process/data.csv"), Charsets.UTF_8);
                    for (String line : lines) {
                        String[] splitted = line.split("\\|");
                        if (splitted[0].equals(machineId)) {
                            process = splitted[1];
                            break;
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }

                return RequestResult.success(priority + process);
            }
        });
    }

    @RequestMapping(value = "savePriority", method = POST)
    public RequestResult<Void> savePriority(@RequestBody final List<Map> newResult) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                for (Map map : newResult) {
                    MachinePriority machinePriority = new MachinePriority();
                    machinePriority.fromMap(map);
                    if (machinePriority.exists()) {
                        machinePriority.saveIt();
                    } else {
                        machinePriority.insert();
                    }
                }
                return RequestResult.success();
            }
        });
    }

    /**
     * (1) 新增維修記錄
     *
     * 狀況可能:
     *   1. alarm 發生
     *   2. macro522 = 101 (這種情況下 (2) 就不會且不該被呼叫)
     *
     * 請求格式:
     *   {
     *     "machine_id": "CNC1",
     *     "alarm_time": "2016/07/26 17:03:08",
     *     "notify_time": "2016/07/26 17:03:08", (optional)
     *     "alarm_code": "1234",
     *     "work_shift": "B",
     *     "care_emp_id": "01234",
     *     "n6": "10 G N",
     *     "m523": "60726.003"
     *   }
     */
    @RequestMapping(value = "createRepairRecord", method = POST)
    public RequestResult<String> createRepairRecord(@RequestBody final Map record) {
        if (!record.containsKey("machine_id") || !record.containsKey("alarm_time")) {
            return RequestResult.fail("欄位不足...");
        }

        String workShiftName = WorkShiftTimeService.nowActualShiftTime().getNowShiftTime().get("name").toString();
        record.put("work_shift", workShiftName);

        // 寫入開始維修時的標準工時
        record.put("start_standard_second", getStandardSecond(record));

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairRecord repairRecord = new RepairRecord();
                repairRecord.fromMap(record);

                if (repairRecord.insert()) {
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("未知失敗原因");
                }
            }
        });
    }

    private double getStandardSecond(Map record) {
        String machineId = record.get("machine_id").toString();
        String op = record.get("n6").toString();
        String orderId = record.get("m523").toString();
        if ( op.split(" ").length > 2) {
            orderId = op.split(" ")[1] + orderId;
        }
        try {
            SimpleExhalable exhalable = HippoService.getInstance().newSimpleExhaler()
                    .space("standard_second")
                    .index("machine_id", new String[]{machineId})
                    .index("op", new String[]{op})
                    .index("order_id", new String[]{orderId})
                    .columns("std_second")
                    .exhale()
                    .get();
            List<Map<String, Atom>> list = exhalable.toMapping();
            if (list.size() == 1) {
                return list.get(0).get("std_second").asDouble();
            } else {
                log.warn("Can not find standard second with machine_id: " + machineId + ", op: " + op + ", order_id: " + orderId);
                return 0.0;
            }
        } catch (Exception e) {
            log.warn("Exhale standard second failed with machine_id: " + machineId + ", op: " + op + ", order_id: " + orderId);
            e.printStackTrace();
            return 0.0;
        }
    }

    /**
     * (2) 警報通知，macro522 = 101
     */
    @RequestMapping(value = "alarmNotify", method = POST)
    public RequestResult<String> alarmNotify(@RequestBody Map record) {
        if (!record.containsKey("machine_id") || !record.containsKey("alarm_time") || !record.containsKey("notify_time")) {
            return RequestResult.fail("欄位不足...");
        }

        return updateRepairRecord(record, "notify_time");
    }

    /**
     * (3) 維修指派
     *
     * 狀況可能
     *   1. 自動指派 (未派工的情況下)
     *   2. 手動指派 (未派工的情況下)
     *
     * 請求格式:
     *   {
     *       "repairRecord": {
     *           "machine_id": "CNC1",
     *           "alarm_time": "2016/07/26 17:03:08",
     *           "repair_emp_id": "A1234"
     *       },
     *       "repairEmpStatus": {
     *           "user_id": "XXX",
     *           "start_time": "2016/07/26 17:03:08",
     *           "machine_id": "CNC1",
     *           "priority": 3,
     *           "alarm_time": "2016/07/26 17:03:08"
     *       }
     *   }
     *
     * 回傳格式:
     *   yyyy/MM/dd|work_shift_name
     */
    @RequestMapping(value = "specifyRepairEmp", method = POST)
    public RequestResult<String> specifyRepairEmp(@RequestBody final Map record) {
        return specify(record, false);
    }

    /**
     * (3) 的變形
     *
     * 可能手動指派把人換掉
     * 參數跟 (3) 一樣
     */
    @RequestMapping(value = "reSpecifyRepairEmp", method = POST)
    public RequestResult<String> reSpecifyRepairEmp(@RequestBody final Map record) {
        return specify(record, true);
    }

    private RequestResult<String> specify(final Map record, final boolean isRespecify) {
        WorkShiftTimeService.NowActualShiftTime workShiftTime = WorkShiftTimeService.nowActualShiftTime();

        String date = workShiftTime.getLogicallyDate8Bits();
        final String dateSlashed = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);
        final String workShiftName = (String) workShiftTime.getNowShiftTime().get("name");

        final Map repairRecordMap = (Map) record.get("repairRecord");
        final Map repairEmpStatusMap = (Map) record.get("repairEmpStatus");
        repairEmpStatusMap.put("logically_date", dateSlashed);
        repairEmpStatusMap.put("work_shift_name", workShiftName);

        if (!repairRecordMap.containsKey("machine_id") || !repairRecordMap.containsKey("alarm_time") || !repairRecordMap.containsKey("repair_emp_id")) {
            return RequestResult.fail("欄位不足...");
        }

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                if (!isRespecify) {
                    RepairRecord old = RepairRecord.findByCompositeKeys(repairRecordMap.get("machine_id"), repairRecordMap.get("alarm_time"));
                    if (old.get("repair_emp_id") != null) {
//                        throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗，因為已經被派過了...");
                        log.warn("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗，因為已經被派過了...");
                    }
                }

                RepairRecord repairRecord = new RepairRecord();
                repairRecord.fromMap(repairRecordMap);
                if (!repairRecord.saveIt()) {
                    throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairRecord save failed.");
                }

                // 指派和重新指派的差異點
                // 指派和重新指派的差異點
                // 指派和重新指派的差異點
                if (isRespecify) {
                    RepairEmpStatus repairEmpStatus = RepairEmpStatus.findFirst("machine_id = ? AND alarm_time = ?", repairRecordMap.get("machine_id"), repairRecordMap.get("alarm_time"));
                    repairEmpStatus.delete();
                }

                RepairEmpStatus repairEmpStatus = new RepairEmpStatus();
                repairEmpStatus.fromMap(repairEmpStatusMap);
                if (!repairEmpStatus.insert()) {
                    throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairEmpStatus insert failed.");
                }

                return RequestResult.success(dateSlashed + "|" + workShiftName);
            }
        });
    }

    /**
     * (4) 開始維修
     */
    @RequestMapping(value = "startRepair", method = POST)
    public RequestResult<String> startRepair(@RequestBody Map record) {
        if (!record.containsKey("machine_id") || !record.containsKey("alarm_time") || !record.containsKey("start_time")
                || !record.containsKey("act_repair_emp_id")) {
            return RequestResult.fail("欄位不足...");
        }

        return updateRepairRecord(record, "start_time", "act_repair_emp_id");
    }

    @RequestMapping(value = "startRepairWithoutDispatch", method = POST)
    public RequestResult<String> startRepairWithoutDispatch(@RequestBody Map record) {
        if (!record.containsKey("machine_id") || !record.containsKey("alarm_time") || !record.containsKey("dispatch_time")
                || !record.containsKey("repair_emp_id") || !record.containsKey("start_time") || !record.containsKey("act_repair_emp_id")) {
            return RequestResult.fail("欄位不足...");
        }

        return updateRepairRecord(record, "dispatch_time", "repair_emp_id", "start_time", "act_repair_emp_id");
    }

    /**
     * (5) 維修結束，macro522 = 100
     *
     * 請求格式:
     *   {
     *       "repairRecord": {
     *           "machine_id": "CNC1",
     *           "alarm_time": "2016/07/26 17:03:08",
     *           "end_time": "2016/07/26 17:03:07"
     *       },
     *       "repairEmpStatus": {
     *           "logically_date": "2015/07/26",
     *           "user_id": "XXX",
     *           "work_shift_name": "A",
     *           "start_time": "2016/07/26 17:03:08",
     *           "end_time": "2016/07/26 17:03:09"
     *       }
     *   }
     */
    @RequestMapping(value = "endRepair", method = POST)
    public RequestResult<String> endReapir(@RequestBody Map record) {

        final Map repairRecordMap = (Map) record.get("repairRecord");
        final Map repairEmpStatusMap = (Map) record.get("repairEmpStatus");

        if (!repairRecordMap.containsKey("machine_id") || !repairRecordMap.containsKey("alarm_time") || !repairRecordMap.containsKey("end_time")) {
            return RequestResult.fail("欄位不足...");
        }

        if (!repairEmpStatusMap.isEmpty()) {
            if (!repairEmpStatusMap.containsKey("logically_date") || !repairEmpStatusMap.containsKey("user_id") ||
                    !repairEmpStatusMap.containsKey("work_shift_name") || !repairEmpStatusMap.containsKey("start_time") || !repairEmpStatusMap.containsKey("end_time")) {
                return RequestResult.fail("欄位不足...");
            }
        }

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairRecord old = RepairRecord.findByCompositeKeys(repairRecordMap.get("machine_id"), repairRecordMap.get("alarm_time"));
                
                if (old != null && old.get("end_time") != null) {
                    log.warn("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... no end_time.但還是讓它結束。");
                    // 其實應該要檢查的，因為一筆警報應該只會結束一次，但有可能導致DB的狀態與派工狀態不符導致永遠無法結束
                    // throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... no end_time.");
                }

                RepairRecord repairRecord = new RepairRecord();
                repairRecord.fromMap(repairRecordMap);
                // 寫入結束維修時的標準工時
                repairRecord.set("end_standard_second", getStandardSecond(old.toMap()));

                if (!repairRecord.saveIt()) {
                    throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairRecord save failed.");
                }

                // 2017-05-22 Mantis #0000527
                // 在無法派工情境下，主管會請其它校車人員或廠長親自進行維修，因此沒有repairEmpStatus可供紀錄
                // 因為 RepairEmpStatus 的維修人員是 EmpCheckIn 的 FK
                if (!repairEmpStatusMap.isEmpty()) {
                    RepairEmpStatus repairEmpStatus = new RepairEmpStatus();
                    repairEmpStatus.fromMap(repairEmpStatusMap);
                    if (!repairEmpStatus.saveIt()) {
                        throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairEmpStatus save failed.");
                    }
                }

                return RequestResult.success();
            }
        });
    }

    @RequestMapping(value = "terminate", method = POST)
    public RequestResult<String> terminate(@RequestBody Map record) {

        final Map repairRecordMap = (Map) record.get("repairRecord");
        final Map repairEmpStatusMap = (Map) record.get("repairEmpStatus");

        if (!repairRecordMap.containsKey("machine_id") || !repairRecordMap.containsKey("alarm_time")) {
            return RequestResult.fail("欄位不足...");
        }

        final List<String> updateColumns = new ArrayList<String>();
        if (repairRecordMap.containsKey("notify_time")) {
            updateColumns.add("notify_time");
        }
        if (repairRecordMap.containsKey("repair_emp_id")) {
            updateColumns.add("repair_emp_id");
        }
        if (repairRecordMap.containsKey("start_time")) {
            updateColumns.add("start_time");
        }
        if (repairRecordMap.containsKey("end_time")) {
            updateColumns.add("end_time");
        }
        if (repairRecordMap.containsKey("act_repair_emp_id")) {
            updateColumns.add("act_repair_emp_id");
        }

        // 非空表示曾經被派工過
        if (!repairEmpStatusMap.isEmpty()) {
            if (!repairEmpStatusMap.containsKey("logically_date") || !repairEmpStatusMap.containsKey("user_id") ||
                    !repairEmpStatusMap.containsKey("work_shift_name") || !repairEmpStatusMap.containsKey("start_time") || !repairEmpStatusMap.containsKey("end_time")) {
                return RequestResult.fail("欄位不足...");
            }
        }

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairRecord old = RepairRecord.findByCompositeKeys(repairRecordMap.get("machine_id"), repairRecordMap.get("alarm_time"));
                for (String updateColumn : updateColumns) {
                    if (old.get(updateColumn) != null) {
//                        throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗..." + updateColumn + " 已存在!!");
                        log.warn("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改流程異常..." + updateColumn + " 已存在!!");
                    }
                }

                RepairRecord repairRecord = new RepairRecord();
                repairRecord.fromMap(repairRecordMap);
                if (!repairRecord.saveIt()) {
                    throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairRecord save failed.");
                }

                if (!repairEmpStatusMap.isEmpty()) {
                    RepairEmpStatus repairEmpStatus = new RepairEmpStatus();
                    repairEmpStatus.fromMap(repairEmpStatusMap);
                    if (!repairEmpStatus.saveIt()) {
                        throw new RuntimeException("維修記錄 " + repairRecordMap.get("machine_id") + " - " + repairRecordMap.get("alarm_time") + " 修改失敗... repairEmpStatus save failed.");
                    }
                }

                return RequestResult.success();
            }
        });

//        return updateRepairRecord(record, updateColumnArr);
    }

    @RequestMapping(value = "createRepairStatus", method = POST)
    public RequestResult<String> createRepairStatus(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairStatus repairStatus = new RepairStatus();
                repairStatus.fromMap(data);

                if (repairStatus.insert()) {
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("新增失敗");
                }
            }
        });
    }

    /**
    * data = [{
    *   machine_id:"H001",
    *   alarm_time:"2016/08/23 11:49:52",
    *   repair_code:"207",
    *   count: 1,
    *   is_updated: 1
    * }, ...]
    **/
    @RequestMapping(value = "createRepairItems", method = POST)
    public RequestResult<String> createRepairItems(@RequestBody final Map[] data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String result = "";
                Object createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                Timestamp CreateTime = new Timestamp(System.currentTimeMillis());
                // 查非刀具的維修代碼(維修類型為9開頭)
                List<Map> minorTypeRepairCode = Base.findAll("SELECT repair_code FROM a_huangliang_repair_code WHERE repair_type_id LIKE '9%'");

                try {
                    // 先全部清空該次警報的維修項目
                    if (data.length > 0) {
                        String machineId = data[0].get("machine_id").toString();
                        String alarmTime = data[0].get("alarm_time").toString();
                        StringJoiner repairCodeStrJoiner = new StringJoiner(", ", "(", ")");
                        for (Map repairCodeMap : minorTypeRepairCode) {
                          repairCodeStrJoiner.add("'" + repairCodeMap.get("repair_code").toString() + "'");
                        }
                        String deleteSqlStr = "machine_id = ? AND alarm_time = ? AND repair_code IN " + repairCodeStrJoiner.toString();
                        int deleteCount = RepairItem.delete(deleteSqlStr, machineId, alarmTime);
                        log.info("delete count: " + deleteCount + "; machine_id: " + machineId + "; alarm_time: " + alarmTime + "; deleteSqlStr: " + deleteSqlStr);
                    }
                    // 再新增更新的維修項目
                    for (Map map : data) {

                        if (map.get("repair_code") == null) {
                            continue;
                        }

                        map.put("create_by", createBy);
                        map.put("create_time", CreateTime);
                        RepairItem repairItem = new RepairItem();
                        repairItem.fromMap(map);

                        if (!repairItem.insert()) {
                            result += repairItem.get("repair_code").toString() + " 新增失敗 ;";
                        }
                    }

                    if (result.equals("")) {
                        return RequestResult.success();
                    } else {
                        return RequestResult.fail(result);
                    }
                } catch (Exception e) {
                    return RequestResult.fail(e.getMessage());
                }

            }
        });
    }

    @RequestMapping(value = "read", method = POST)
    public RequestResult<List<Map>> readRepairRecord(@RequestBody final ReadParam readParam) {
//        @RequestParam (value = "startDate", required = false) final String startDate,
//        @RequestParam (value = "endDate", required = false) final String endDate,
//        @RequestParam (value = "machineIds[]", required = false) final String[] machineIds,
//        @RequestParam (value = "employeeIds[]", required = false) final String[] employeeIds,
//        @RequestParam (value = "repairCodes[]", required = false) final String[] repairCodes) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> repairRecordList;
                List<String> repairCodeList = null;
                if (readParam.repairCodes != null) {
                    repairCodeList = readParam.repairCodes;
                }

                if (readParam.startDate == null) {
                    repairRecordList = RepairRecord.findAll().orderBy("alarm_time").toMaps();
                } else if (readParam.employeeIds != null) {
                    List<String> param = new ArrayList<String>();
                    param.add(readParam.startDate + " 00:00:00");
                    param.add(readParam.endDate + " 23:59:59");
                    param.addAll(readParam.machineIds);
                    param.addAll(readParam.employeeIds);

                    repairRecordList = RepairRecord.where("alarm_time BETWEEN ? AND ? AND " +
                        "machine_id IN (" + Util.strSplitBy("?", ",", readParam.machineIds.size()) + ") AND " +
                        "act_repair_emp_id IN (" + Util.strSplitBy("?", ",", readParam.employeeIds.size()) + ")",
                        param.toArray())
                        .orderBy("alarm_time").toMaps();

                } else {
                    Object[] param = new Object[readParam.machineIds.size() + 2];
                    param[0] = readParam.startDate + " 00:00:00";
                    param[1] = readParam.endDate + " 23:59:59";
                    for (int i = 2; i < readParam.machineIds.size() + 2; i++) {
                        param[i] = readParam.machineIds.get(i - 2);
                    }
                    repairRecordList = RepairRecord.where("alarm_time BETWEEN ? AND ? AND " +
                        "machine_id IN (" + Util.strSplitBy("?", ",", readParam.machineIds.size()) + ")", param)
                        .orderBy("alarm_time").toMaps();
                }

                DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                Boolean containsRepairCode;
                for (Map repairRecord : repairRecordList) {
                    containsRepairCode = false;

                    //format dateTime
                    repairRecord.put("alarm_time", df.format((Date) repairRecord.get("alarm_time")));

                    if (repairRecord.containsKey("notify_time")) {
                        repairRecord.put("notify_time", df.format((Date) repairRecord.get("notify_time")));
                    } else {
                        repairRecord.put("notify_time", "---");
                    }

                    if (repairRecord.containsKey("dispatch_time")) {
                        repairRecord.put("dispatch_time", df.format((Date) repairRecord.get("dispatch_time")));
                    } else {
                        repairRecord.put("dispatch_time", "---");
                    }

                    if (repairRecord.containsKey("start_time")) {
                        repairRecord.put("start_time", df.format((Date) repairRecord.get("start_time")));
                    } else {
                        repairRecord.put("start_time", "---");
                    }

                    if (repairRecord.containsKey("end_time")) {
                        repairRecord.put("end_time", df.format((Date) repairRecord.get("end_time")));
                    } else {
                        repairRecord.put("end_time", "---");
                    }

                    //當次警報中出現那些macro
                    List<Map> repairStatusList = RepairStatus.where("machine_id = ? AND alarm_time = ?",
                        repairRecord.get("machine_id"), repairRecord.get("alarm_time")).toMaps();
                    for (Map repairStatus : repairStatusList) {
                        repairStatus.put("alarm_time", df.format((Date) repairStatus.get("alarm_time")));
                        repairStatus.put("start_time", df.format((Date) repairStatus.get("start_time")));
                    }
                    repairRecord.put("repair_status", repairStatusList);

                    //當次警報的維修項目
                    List<Map> repairItemList = RepairItem.where("machine_id = ? AND alarm_time = ?",
                        repairRecord.get("machine_id"), repairRecord.get("alarm_time")).toMaps();
                    if (repairCodeList != null && repairCodeList.size() > 0) {//要過濾維修項目

                        //該次警報的維修項目是否包含使用者查詢的項目
                        for (Map map2 : repairItemList) {
                            if (repairCodeList.contains(map2.get("repair_code").toString())) {
                                containsRepairCode = true;
                            }
                            map2.put("alarm_time", df.format((Date) map2.get("alarm_time")));
                        }
                        //該次警報包含使用者查詢的項目 或 該次警報尚未填寫維修項目
                        if (containsRepairCode || repairItemList.size() == 0) {
                            repairRecord.put("repair_item", repairItemList);
                        }

                    } else {//給其他查詢條件沒有維修項目的功能用
                        for (Map map2 : repairItemList) {
                            map2.put("alarm_time", df.format((Date) map2.get("alarm_time")));
                        }
                        repairRecord.put("repair_item", repairItemList);
                    }

                    // 新增品質檢測數據維護.維修首件不良品
                    int repairFirstDefectives = 0;
                    try {
                        QualityExamData qualityExamData = QualityExamData.findFirst("employee_id = ? AND work_shift_name = ? AND machine_id = ? " +
                                "AND order_id = ?", repairRecord.get("care_emp_id"), repairRecord.get("work_shift"), repairRecord.get("machine_id"),
                                repairRecord.get("n6").toString().split(" ")[1] + repairRecord.get("m523"));
                        repairFirstDefectives = Integer.parseInt(qualityExamData.get("qualityExamData").toString());
                    } catch (Exception e) {
//                        log.warn("No quality_exam_data.repair_first_defectives with employee_id: " + repairRecord.get("care_emp_id") +
//                                " work_shift_name: " + repairRecord.get("work_shift") + " machine_id: " + repairRecord.get("machine_id") +
//                                " n6: " + repairRecord.get("n6") + " m523: " + repairRecord.get("m523"));
                    }
                    repairRecord.put("repair_first_defectives", repairFirstDefectives);

                }
                return RequestResult.success(repairRecordList);
            }
        });
    }

    private RequestResult<String> updateRepairRecord(final Map record, final String... updateColumns) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairRecord old = RepairRecord.findByCompositeKeys(record.get("machine_id"), record.get("alarm_time"));

                // 檢查要寫入值的欄位是否已經有值
                for (String updateColumn : updateColumns) {
                    if (old.get(updateColumn) != null) {
                        return RequestResult.fail("維修記錄 " + record.get("machine_id") + " - " + record.get("alarm_time") + " 修改失敗..." + updateColumn + " 已存在!!");
                    }
                }

                RepairRecord repairRecord = new RepairRecord();
                repairRecord.fromMap(record);
                if (repairRecord.saveIt()) {

                    // if repair_emp_id != act_repair_emp_id, release repair_emp_id
                    String repairEmp = old.get("repair_emp_id") == null ? "" : old.get("repair_emp_id").toString();
                    String actRepairEmp = repairRecord.get("act_repair_emp_id") == null ? "" : repairRecord.get("act_repair_emp_id").toString();
                    while (repairEmp.startsWith("0")) {
                        repairEmp = repairEmp.substring(1);
                    }
                    if (!repairEmp.equals("") && !repairEmp.equals("---") && !actRepairEmp.equals("") && !actRepairEmp.equals("---") &&
                            !actRepairEmp.equals(repairEmp)) {
                        DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                        RepairEmpStatus repairEmpStatus = RepairEmpStatus.findFirst("machine_id = ? AND alarm_time = ?",
                                repairRecord.get("machine_id"), repairRecord.get("alarm_time"));
                        repairEmpStatus.set("end_time", df.format(new Date()));
                        repairEmpStatus.saveIt();
                        log.info("實際維修人員為： " + actRepairEmp + "，因此將原指派維修人員 " + repairEmp + " 釋放");
                    }

                    return RequestResult.success();
                } else {
                    return RequestResult.fail("維修記錄 " + record.get("machine_id") + " - " + record.get("alarm_time") + " 修改失敗... repairRecord save failed.");
                }
            }
        });
    }

    @RequestMapping(value = "notify", method = POST)
    public RequestResult<String> notify(@RequestBody final Map notifyRecord) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                RepairDelay repairDelay = new RepairDelay();
                repairDelay.fromMap(notifyRecord);

                if (repairDelay.insert()) {
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("囧");
                }
            }
        });
    }

    @RequestMapping(value = "notDispatch", method = GET)
    public RequestResult<List<Map>> getNotDispatch(@RequestParam(value = "machineId", required = false) final String machineId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                LazyList<RepairRecord> repairRecordList;
                if (machineId == null) {
                    repairRecordList = RepairRecord.where("notify_time IS NOT NULL AND repair_emp_id IS NULL");
                } else {
                    repairRecordList = RepairRecord.where("machine_id = ? AND notify_time IS NOT NULL AND repair_emp_id IS NULL", machineId);
                }
                List<Map> result = repairRecordList.orderBy("alarm_time desc").toMaps();
                DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                for (Map map : result) {
                    map.put("notify_time", df.format(map.get("notify_time")));
                    map.put("alarm_time", df.format(map.get("alarm_time")));
                }
                return RequestResult.success(result);
            }
        });
    }

    @RequestMapping(value = "notRepair", method = GET)
    public RequestResult<List<Map>> getNotRepair(@RequestParam(value = "machineId", required = false) final String machineId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                LazyList<RepairRecord> repairRecordList;
                if (machineId == null) {
                    repairRecordList = RepairRecord.where("repair_emp_id IS NOT NULL AND start_time IS NULL");
                } else {
                    repairRecordList = RepairRecord.where("machine_id = ? AND repair_emp_id IS NOT NULL AND start_time IS NULL");
                }
                List<Map> result = repairRecordList.orderBy("alarm_time desc").toMaps();
                DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                for (Map map : result) {
                    map.put("notify_time", df.format(map.get("notify_time")));
                    map.put("alarm_time", df.format(map.get("alarm_time")));
                }
                return RequestResult.success(result);
            }
        });
    }

    @RequestMapping(value = "machineCondition", method = GET)
    public RequestResult<Map> machineCondition(@RequestParam(value = "machineId") final String machineId) {
        return ActiveJdbc.oper(new Operation<RequestResult<Map>>() {
            @Override
            public RequestResult<Map> operate() {
                List<Map> result = RepairRecord.findBySQL("SELECT b.* " +
                                                          "FROM (SELECT machine_id, MAX(alarm_time) alarm_time FROM a_huangliang_repair_record GROUP BY machine_id) a " +
                                                          "INNER JOIN a_huangliang_repair_record b " +
                                                          "USING(machine_id, alarm_time) " +
                                                          "WHERE machine_id = ?;", machineId).toMaps();

                MachinePriority machinePriority = MachinePriority.findById(machineId);
                int priority = machinePriority == null ? 0 : machinePriority.getInteger("priority");

                if (!result.isEmpty()) {
                    Map map = result.get(0);
                    DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

                    map.put("alarm_time", df.format((Date) map.get("alarm_time")));
                    map.put("priority", priority);

                    if (map.containsKey("notify_time")) {
                        map.put("notify_time", df.format((Date) map.get("notify_time")));
                    } else {
                        map.put("notify_time", "---");
                    }

                    if (map.containsKey("start_time")) {
                        map.put("start_time", df.format((Date) map.get("start_time")));
                    } else {
                        map.put("start_time", "---");
                    }

                    if (map.containsKey("end_time")) {
                        map.put("end_time", df.format((Date) map.get("end_time")));
                    } else {
                        map.put("end_time", "---");
                    }

                    setStatus(map);

                    return RequestResult.success(map);
                } else {
                    return RequestResult.fail((Map)new HashMap());
                }

            }

            /**
             * notDispatch | notRepair | repairing | complete
             */
            private void setStatus(Map map) {
                if (!map.containsKey("repair_emp_id")) {
                    map.put("status", "notDispatch");
                    return;
                }
                if (map.get("start_time").equals("---")) {
                    map.put("status", "notRepair");
                    return;
                }
                if (map.get("end_time").equals("---")) {
                    map.put("status", "repairing");
                    return;
                }
                map.put("status", "complete");
            }
        });
    }

    @RequestMapping(value = "regulateNotifyLog", method = POST)
    public RequestResult<Boolean> regulateNotifyLog(@RequestBody final Map notifyParam) {
        return ActiveJdbc.oper(new Operation<RequestResult<Boolean>>() {
            @Override
            public RequestResult<Boolean> operate() {
                try {
                    RegulateNotifyLog regulateNotifyLog = new RegulateNotifyLog();
                    regulateNotifyLog.fromMap(notifyParam);
                    if (regulateNotifyLog.insert()) {
                        return RequestResult.success(true);
                    } else {
                        log.warn("Insert regulate_notify_log failed with machineId: " + notifyParam.get("machine_id"));
                        return RequestResult.fail(false);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    log.error(e.getMessage());
                    return RequestResult.fail(false);
                }
            }
        });
    }

    public static class Record {
        public String datetime;
        public String notifyTime;
        public String machineId;
        public String machineName;
        public String repairEmpId;
        public String repairEmpName;
    }

    public static class ReadParam {
        String startDate;
        String endDate;
        List<String> machineIds;
        List<String> employeeIds;
        List<String> repairCodes;
    }
}
