package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.RepairEmpCheckIn;
import com.servtech.servcloud.app.model.huangliang.RepairEmpStatus;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2016/8/4 下午 03:32
 */
@RestController
@RequestMapping("/huangliang/repairDispatch")
public class HuangLiangRepairEmpDispatchController {

    private static final Logger LOG = LoggerFactory.getLogger(HuangLiangRepairEmpDispatchController.class);

    @RequestMapping(value = "giveMeEmp", method = RequestMethod.GET)
    public RequestResult<String> giveMeEmployee(@RequestParam(value = "machineId") final String machineId,
                                                @RequestParam(value = "priority") final int priority) {
        WorkShiftTimeService.NowActualShiftTime workShiftTime = WorkShiftTimeService.nowActualShiftTime();

        String date = workShiftTime.getLogicallyDate8Bits();
        String workShiftName = (String) workShiftTime.getNowShiftTime().get("name");

        List<EmpCheckIn> empCheckInList = getAllEmployee(date, workShiftName);
        List<EmpCheckIn> idleEmpCheckInList = filterIdle(empCheckInList);

//        for (EmpCheckIn empCheckIn : idleEmpCheckInList) {
//            LOG.info("挖哀抖啦: " + empCheckIn.toString());
//        }
        // 有可用人員就直接挑了
        if (!idleEmpCheckInList.isEmpty()) {
            Random random = new Random(new Date().getTime());
            int index = random.nextInt(idleEmpCheckInList.size());
            EmpCheckIn selectedEmpCheckIn = idleEmpCheckInList.get(index);
            return RequestResult.success(selectedEmpCheckIn.getUserId());
        }


        Collections.sort(empCheckInList);

//        for (EmpCheckIn empCheckIn : empCheckInList) {
//            LOG.info("挖排序啦: " + empCheckIn.toString());
//        }
        // 不然就直接拿排序後最小的那位(重要度和累積時間最小的)
        if (!empCheckInList.isEmpty()) {
            EmpCheckIn smallestEmpCheckIn = empCheckInList.get(0);
            if (smallestEmpCheckIn.getMaxPriority() < priority) {
                return RequestResult.success(smallestEmpCheckIn.getUserId());
            }
        }

        // 挑不到啦
        return RequestResult.fail("");
    }

    @RequestMapping(value = "isDispatched", method = RequestMethod.GET)
    public RequestResult<?> isDispatched(@RequestParam(value = "machineId") final String machineId,
                                         @RequestParam(value = "alarmTime") final String alarmTime) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                RepairEmpStatus repairEmpStatus = RepairEmpStatus.findFirst("machine_id = ? AND alarm_time = ?", machineId, alarmTime);
                if (repairEmpStatus != null) {
                    Map result = repairEmpStatus.toMap();
                    DateFormat datetimeFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                    DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
                    result.put("logically_date", dateFormat.format(result.get("logically_date")));
                    result.put("alarm_time", datetimeFormat.format(result.get("alarm_time")));
                    result.put("start_time", datetimeFormat.format(result.get("start_time")));
                    return RequestResult.success(result);
                }
                return RequestResult.fail(null);
            }
        });
    }

    private List<EmpCheckIn> getAllEmployee(String date, final String workShiftName) {
        final String dateSlashed = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);

        List<Map> repairEmpCheckInList = ActiveJdbc.oper(new Operation<List<Map>>() {
            @Override
            public List<Map> operate() {
                // 當班報到且尚未簽退的維修人員
                return RepairEmpCheckIn.where("logically_date = ? AND work_shift_name = ? AND check_out_tsp is null", dateSlashed, workShiftName).toMaps();
            }
        });

        List<EmpCheckIn> result = new ArrayList<EmpCheckIn>();

        for (Map repairEmpCheckIn : repairEmpCheckInList) {
            result.add(new EmpCheckIn(repairEmpCheckIn));
        }
        return result;
    }

    private List<EmpCheckIn> filterIdle(List<EmpCheckIn> empCheckInList) {
        List<EmpCheckIn> result = new ArrayList<EmpCheckIn>();
        for (EmpCheckIn empCheckIn : empCheckInList) {
            if (empCheckIn.isIdle()) {
                result.add(empCheckIn);
            }
        }
        return result;
    }

    private static class EmpCheckIn implements Comparable<EmpCheckIn> {
        private Map repairEmpCheckIn;
        private List<Map> repairEmpStatusList;

        public EmpCheckIn(final Map repairEmpCheckIn) {
            this.repairEmpCheckIn = repairEmpCheckIn;
            this.repairEmpStatusList = ActiveJdbc.oper(new Operation<List<Map>>() {
                @Override
                public List<Map> operate() {
                    return RepairEmpStatus.where("logically_date = ? AND user_id = ? AND work_shift_name = ?",
                                                repairEmpCheckIn.get("logically_date"),
                                                repairEmpCheckIn.get("user_id"),
                                                repairEmpCheckIn.get("work_shift_name")).toMaps();
                }
            });
        }

        public String getUserId() {
            return (String) repairEmpCheckIn.get("user_id");
        }

        public boolean isIdle() {
            for (Map repairEmpStatus : repairEmpStatusList) {
                if (repairEmpStatus.get("end_time") == null) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 尚未完成的所有當中，最小開始時間至當下時間
         */
        public long getDuringMillisecond() {
            if (repairEmpStatusList.isEmpty()) {
                return 0l;
            }
            long startTimestamp = 0l;
            for (Map repairEmpStatus : repairEmpStatusList) {
                if (repairEmpStatus.get("end_time") != null) {
                    continue;
                }
                startTimestamp = Math.min(startTimestamp, ((Date) repairEmpStatusList.get(0).get("start_time")).getTime());
            }
            return new Date().getTime() - startTimestamp;
        }

        /**
         * 尚未完成的所有當中，最大的權限
         */
        public int getMaxPriority() {
            int result = 0;
            for (Map repairEmpStatus : repairEmpStatusList) {
                if (repairEmpStatus.get("end_time") != null) {
                    continue;
                }
                result = Math.max(result, (Integer) repairEmpStatus.get("priority"));
            }
            return result;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append(repairEmpCheckIn.get("logically_date")).append(" - ");
            sb.append(repairEmpCheckIn.get("user_id")).append(" - ");
            sb.append(repairEmpCheckIn.get("work_shift_name")).append(" - ");
            sb.append(repairEmpCheckIn.get("check_in_tsp"));
            for (Map repairEmpStatus : repairEmpStatusList) {
                sb.append("\n\t")
                    .append(repairEmpStatus.get("logically_date")).append(" - ")
                    .append(repairEmpStatus.get("user_id")).append(" - ")
                    .append(repairEmpStatus.get("work_shift_name")).append(" - ")
                    .append(repairEmpStatus.get("start_time")).append(" - ")
                    .append(repairEmpStatus.get("machine_id")).append(" - ")
                    .append(repairEmpStatus.get("priority"));
            }
            return sb.toString();
        }

        /**
         * 先比重要性，再比持續時間
         */
        @Override
        public int compareTo(EmpCheckIn o) {
            int priorityDiff = this.getMaxPriority() - o.getMaxPriority();
            int secondDiff = (int) ((this.getDuringMillisecond() / 1000l) - (o.getDuringMillisecond() / 1000l));
            return priorityDiff == 0 ? secondDiff : priorityDiff;
        }
    }

}
