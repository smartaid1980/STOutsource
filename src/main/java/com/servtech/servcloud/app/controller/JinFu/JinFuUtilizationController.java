package com.servtech.servcloud.app.controller.JinFu;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.servcloud.app.model.JinFu.WorkStatus;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by Kevin on 2019/01/06.
 */
@RestController
@RequestMapping("/jinfu/utilization")
public class JinFuUtilizationController {
    private static final Logger log = LoggerFactory.getLogger(JinFuUtilizationController.class);
    private static String errorStr = "---";
    private static SimpleDateFormat yyyyMMdd = new SimpleDateFormat("yyyyMMddHHmmss");
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private Map<String, Object> recordMachineListAndStartDayAndEndDay;
    private Map<String, List<Map>> workGroupbyPGNameAndMachine;

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> getWorkJoinUtilization(@RequestParam(value = "startDate", required = false) String startDate,
                                                   @RequestParam(value = "endDate", required = false) String endDate,
                                                   @RequestParam(value = "workId", required = false) String workId,
                                                   @RequestParam(value = "calcBy", required = false) String calcBy,
                                                   @RequestParam(value = "workStatus", required = false) String workStatus,
                                                   @RequestParam(value = "machineId[]", required = false) String[] machineId) {
        return ActiveJdbc.operTx(() -> {
            recordMachineListAndStartDayAndEndDay = new HashMap<>();
            workGroupbyPGNameAndMachine = new HashMap<>();
            List<Map> responseData = new ArrayList<>();
            List<Device> all_device = Device.findAll();
            List<Map> workList = Base.findAll(getWhere(startDate, endDate, workId, workStatus, modelListToStringList(all_device)));

            workGroupbyPGNameAndMachine = groupWorkByPGNameAndMachine(responseData, workList);

            Hippo hippo = HippoService.getInstance();
            putUtilizationData(responseData, calcBy, hippo);
            workFilter(responseData, startDate, endDate, workId, workStatus, machineId);
            return RequestResult.success(responseData);
        });
    }

    private Object[] modelListToStringList(List<Device> all_device) {
        List<String> machine_list = new ArrayList<>();
        for (Device device : all_device) {
            machine_list.add(device.getString("device_name"));
        }
        return machine_list.toArray();
    }

    private void workFilter(List<Map> responseData, String startDateStr, String endDateStr, String workId, String workStatus, String[] machine_id_arr) {
        try {
            Iterator<Map> itr = responseData.iterator();
            List<String> machine_id_list = machine_id_arr == null || machine_id_arr.length == 0 ? null : Arrays.asList(machine_id_arr);

            SimpleDateFormat format = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            while (itr.hasNext()) {
                Map map = itr.next();
                String machine_id = map.get("machine_id").toString();
                String work_id = map.get("work_id").toString();
                String is_close = map.get("is_close").toString().equals("Y") ? "closed" : "unclose";
                Date startDate = format.parse(startDateStr + " 00:00:00");
                Date endDate = format.parse(endDateStr + " 23:59:59");
                Date ori_ework_edate = sdf.parse(map.get("ori_exp_edate").toString());
                Date work_edate = sdf.parse(map.get("exp_edate").toString());
                Date work_mdate = sdf.parse(map.get("exp_mdate").toString());

                if (workStatus == null || workStatus.equals("all") || workStatus.equals(is_close)) {
                    if (workId == null || work_id.contains(workId)) {
                        if ((!work_edate.before(startDate) || !ori_ework_edate.before(startDate)) && !work_mdate.after(endDate)) {
                            if (machine_id_list != null && !machine_id_list.contains("ALL") && !machine_id_list.contains(machine_id)) {
                                itr.remove();
                            }
                        } else {
                            itr.remove();
                        }
                    } else {
                        itr.remove();
                    }
                } else {
                    itr.remove();
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }

    private Map<String, List<Map>> groupWorkByPGNameAndMachine(List<Map> responseData, List<Map> workList) {
        Map<String, List<Map>> groupInfo = new HashMap<>();
        try {
            for (int i = 0; i < workList.size(); i++) {
                Map work = workList.get(i);
                work.put("ori_exp_edate", work.get("exp_edate"));
                Device device = Device.findFirst("device_name = ?", work.get("machine_id").toString());
                if (device == null) {
                    setErroInfo(work, "machine_id");
                    responseData.add(work);
                    continue;
                }
                String machineId = device.getString("device_id");

                String groupKey = machineId + "|" + work.get("program_name").toString().split("\\(")[0].split(" ")[0];
                String expMdate = work.get("exp_mdate").toString();
                String expEdate = work.get("exp_edate").toString();


                getMinMdateAndMaxEdate(machineId, sdf.parse(expMdate), sdf.parse(expEdate));

                List<Map> workListMap = groupInfo.get(groupKey) == null ? new ArrayList<>() : groupInfo.get(groupKey);
                workListMap.add(work);


                groupInfo.put(groupKey, workListMap);
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }

        for (Map.Entry<String, List<Map>> map : groupInfo.entrySet()) {
            groupInfo.put(map.getKey(), sortWorkGroup(map.getValue()));
        }
        return groupInfo;
    }

    private void getMinMdateAndMaxEdate(String machineId, Date expMdate, Date expEdate) {
        Map<String, Date> machineInfo = (Map<String, Date>) recordMachineListAndStartDayAndEndDay.get(machineId);
        if (machineInfo == null)
            machineInfo = new HashMap<>();

        if (machineInfo.get("expMdate") == null || expMdate.before(machineInfo.get("expMdate"))) {
            machineInfo.put("expMdate", expMdate);
        }
        if (machineInfo.get("expEdate") == null || expEdate.after(machineInfo.get("expEdate"))) {
            machineInfo.put("expEdate", expEdate);
        }
        recordMachineListAndStartDayAndEndDay.put(machineId, machineInfo);
    }

    private void putUtilizationData(List<Map> responseData, Object calcBy, Hippo hippo) {
        try {
//            System.out.println("recordMachineListAndStartDayAndEndDay : " + recordMachineListAndStartDayAndEndDay.size());
            for (Map.Entry<String, Object> machineMap : recordMachineListAndStartDayAndEndDay.entrySet()) {
                String machineId = machineMap.getKey();
                Map<String, Date> machineInfo = (Map<String, Date>) machineMap.getValue();
                String expMdateTimeStr = sdf.format(machineInfo.get("expMdate"));
                String expEdateTimeStr = sdf.format(machineInfo.get("expEdate"));
                String expMdateStr = expMdateTimeStr.substring(0, 10).replace("-", "");
                String expEdateStr = expEdateTimeStr.substring(0, 10).replace("-", "");

                List<Map<String, Atom>> UtilizationResult = hippo.newSimpleExhaler()
                        .space("utilization_time_detail")
                        .index("machine_id", new String[]{machineId})
                        .indexRange("date", expMdateStr, expEdateStr)
                        .columns("machine_id", "group_id", "date", "work_shift"
                                , "program_name", "power_millisecond", "operate_millisecond"
                                , "cutting_millisecond", "idle_millisecond", "work_shift_millisecond")
                        .exhale().get().toMapping();

                List<Map<String, Atom>> PartCountResult = hippo.newSimpleExhaler()
                        .space("part_count_merged")
                        .index("machine_id", new String[]{machineId})
                        .indexRange("date", expMdateStr, expEdateStr)
                        .columns("group_id", "part_count", "program_name")
                        .exhale().get().toMapping();

//                System.out.println(machineId + " part_count_merged : expMdateStr = " + expMdateStr + ", expEdateStr = " + expEdateStr + ", size = " + PartCountResult.size());
                if (UtilizationResult.size() > 0)
                    loopUtilizationResult(UtilizationResult, calcBy, machineId);
                if (PartCountResult.size() > 0)
                    loopPartCountResult(PartCountResult, machineId);
            }

            for (Map.Entry<String, List<Map>> group : workGroupbyPGNameAndMachine.entrySet()) {
                List<Map> workList = group.getValue();
                for (Map work : workList) {
                    if (work.get("program_name") == null || work.get("program_name").toString().equals("")) {
                        setErroInfo(work, "program_name");
                        responseData.add(work);
                        continue;
                    }

                    if (work.get("power_millisecond") == null)
                        setUtilizationEnptyValue(work);
                    if (work.get("part_count") == null)
                        setPartCountEnptyValue(work);
                    responseData.add(work);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loopPartCountResult(List<Map<String, Atom>> partCountResult, String machineId) throws Exception {
        List<Map> workGroup = new ArrayList<>();
        Map work;
        int workIndex = 0;
        String program_name;
        String groupKey = "";
//        System.out.println("partCountResult size = " + partCountResult.size());
//        int partCountIndex = 0;

        label:
        for (Map<String, Atom> map : partCountResult) {
//            partCountIndex++;
//            if (partCountResult.size() - 1 == partCountIndex) {
//                System.out.println("partCountIndex : " + partCountIndex);
//            }
            Date mapDate = yyyyMMdd.parse(map.get("group_id").asString().substring(0, 14));
            if (map.get("program_name") == null) {
//                System.out.println(map.get("group_id").asString().substring(0, 14) + " program_name is null..");
                continue;
            }

            program_name = map.get("program_name").asString();
            groupKey = machineId + "|" + program_name;
//            System.out.println(map.get("group_id").asString().substring(0, 14) + " groupKey : " + groupKey);
            workGroup = workGroupbyPGNameAndMachine.get(groupKey);
            if (workGroup == null) {
//                System.out.println("groupKey is null :  " + groupKey);
                continue;
            }
            workIndex = 0;
            while (true) {

                if (workGroup.size() == 0 || workGroup.size() <= workIndex)
                    continue label;
                work = workGroup.get(workIndex);

                Date expMdate = sdf.parse(work.get("exp_Mdate").toString());
                Date expEdate = sdf.parse(work.get("exp_Edate").toString());

                if (mapDate.before(expMdate) && mapDate.before(expEdate)) {
//                    System.out.println(work.get("work_id").toString() + " break exp_Mdate: " + work.get("exp_Mdate").toString() + ",exp_Edate: " + work.get("exp_Edate").toString());
                    continue label;
                }

                if ((mapDate.after(expMdate) || mapDate.equals(expMdate)) && (mapDate.before(expEdate) || mapDate.equals(expEdate))) {
                    Long part_count = work.get("part_count") == null ? 1 : (Long) work.get("part_count") + 1;
                    work.put("part_count", part_count);
                    work.put("part_count_diff", part_count - (Long) work.get("work_qty"));
                    work.put("completion_percentage", formatPercentage(part_count, (Long) work.get("work_qty")));
                    //新需求可以在這邊改變累計區間，且需調整loopPartCountResult 與 loopUtilizationResult的執行順序
                    workGroup.set(workIndex, work);
                    workGroupbyPGNameAndMachine.put(groupKey, workGroup);
                    break;
                } else {
                    workIndex++;
                }
            }
        }
        workIndex++;
        if (workGroup == null)
            return;
        if (workGroup.size() <= workIndex)
            return;
        if (workGroup.size() > workIndex) {
            for (int i = workIndex; i < workGroup.size(); i++) {
                Map enptyWork = workGroup.get(i);
//                System.out.println("enptyWork : " + enptyWork.get("work_id"));
                setPartCountEnptyValue(enptyWork);
                workGroup.set(i, enptyWork);
            }
        }
        workGroupbyPGNameAndMachine.put(groupKey, workGroup);

    }

    private void loopUtilizationResult(List<Map<String, Atom>> utilizationResult, Object calcBy, String machineId) throws Exception {
        //存放不重複的工作日
        HashSet<String> natural_day = new HashSet<>();

        List<Map> workGroup = new ArrayList<>();
        Map work;
        int workIndex = 0;
        String program_name;
        String groupKey = "";

        label:
        for (Map<String, Atom> map : utilizationResult) {

            Date mapDate = yyyyMMdd.parse(map.get("group_id").asString().substring(0, 14));
            if (map.get("program_name") == null)
                continue;
            program_name = map.get("program_name").asString();
            groupKey = machineId + "|" + program_name;
            workGroup = workGroupbyPGNameAndMachine.get(groupKey);
            if (workGroup == null)
                continue;
            while (true) {

                if (workGroup.size() == 0 || workGroup.size() <= workIndex)
                    return;
                work = workGroup.get(workIndex);
                Date expMdate = sdf.parse(work.get("exp_Mdate").toString());
                Date expEdate = sdf.parse(work.get("exp_Edate").toString());

                if (mapDate.before(expMdate) && mapDate.before(expEdate))
                    continue label;
//                System.out.println("exp_Mdate : " + work.get("exp_Mdate").toString() + "|exp_Edate : " + work.get("exp_Edate").toString() + "|mapDate : " + sdf.format(mapDate));
                if ((mapDate.after(expMdate) || mapDate.equals(expMdate)) && (mapDate.before(expEdate) || mapDate.equals(expEdate))) {

                    //如果機台有通電，記錄下日期
                    if (map.get("power_millisecond").asLong() > 0) {
                        natural_day.add(map.get("date").asString());
                    }

                    Long power_millisecond = work.get("power_millisecond") == null ? map.get("power_millisecond").asLong() : (Long) work.get("power_millisecond") + map.get("power_millisecond").asLong();
                    Long operate_millisecond = work.get("operate_millisecond") == null ? map.get("operate_millisecond").asLong() : (Long) work.get("operate_millisecond") + map.get("operate_millisecond").asLong();
                    Long cutting_millisecond = work.get("cutting_millisecond") == null ? map.get("cutting_millisecond").asLong() : (Long) work.get("cutting_millisecond") + map.get("cutting_millisecond").asLong();
                    Long workshift_millisecond = work.get("workshift_millisecond") == null ? map.get("work_shift_millisecond").asLong() : (Long) work.get("workshift_millisecond") + map.get("work_shift_millisecond").asLong();
                    Long denominator;
                    if (calcBy == null || calcBy.toString().equals("power_millisecond")) {
                        denominator = power_millisecond;
                    } else if (calcBy.toString().equals("workshift_millisecond")) {
                        denominator = workshift_millisecond;
                    } else {
                        denominator = natural_day.size() * 24 * 60 * 60 * 1000L;
                    }
//                    System.out.println(power_millisecond + "|" + operate_millisecond + "|" + cutting_millisecond + "|" + workshift_millisecond + "|" + denominator);
                    work.put("power_millisecond", power_millisecond);
                    work.put("operate_millisecond", operate_millisecond);
                    work.put("cutting_millisecond", cutting_millisecond);
                    work.put("downtime", power_millisecond - operate_millisecond);
                    work.put("utilization", formatPercentage(operate_millisecond, denominator));
                    work.put("effective_utilization", formatPercentage(cutting_millisecond, denominator));
                    work.put("workshift_millisecond", workshift_millisecond);
                    workGroup.set(workIndex, work);
                    workGroupbyPGNameAndMachine.put(groupKey, workGroup);
                    break;
                } else {
                    natural_day.clear();
                    workIndex++;
                }
            }
        }
        workIndex++;
        if (workGroup == null)
            return;
        if (workGroup.size() <= workIndex)
            return;
        if (workGroup.size() > workIndex) {
            for (int i = workIndex; i < workGroup.size(); i++) {
//                System.out.println(".....");
                Map enptyWork = workGroup.get(i);
                setUtilizationEnptyValue(enptyWork);
                workGroup.set(i, enptyWork);
            }
        }
        workGroupbyPGNameAndMachine.put(groupKey, workGroup);
    }

    private void loopGroup() {
        for (Map.Entry<String, List<Map>> result : workGroupbyPGNameAndMachine.entrySet()) {
            log.info(result.getKey());
            for (Map res : result.getValue()) {
                log.info(res.get("work_id").toString() + "|" + res.get("work_qty").toString());
            }
        }
    }

    private List<Map> sortWorkGroup(List<Map> workGroup) {
        List<Map> result = new ArrayList<>();
        try {
            while (workGroup.size() != 0) {
                Date minExpMdate = null;
                Map<Date, Map<String, Object>> recordDateAndWorkInfo = new HashMap<>();
                for (int i = 0; i < workGroup.size(); i++) {
                    Map map = workGroup.get(i);
                    Date expMdate = sdf.parse(map.get("exp_Mdate").toString());

                    if (minExpMdate == null || expMdate.before(minExpMdate)) {
                        minExpMdate = expMdate;
                    }

                    Map<String, Object> dateRecord = (Map<String, Object>) recordDateAndWorkInfo.get(expMdate);
                    if (dateRecord == null) {
                        dateRecord = new HashMap<>();
                    }

                    int count = dateRecord.get("count") == null ? 1 : (int) dateRecord.get("count") + 1;
                    dateRecord.put("count", count);
                    List<Integer> workIndexList = dateRecord.get("workIndexList") == null ? new ArrayList<>() : (List<Integer>) dateRecord.get("workIndexList");
                    workIndexList.add(i);
                    dateRecord.put("workIndexList", workIndexList);
                    recordDateAndWorkInfo.put(expMdate, dateRecord);
                }

                List<Integer> workIndexList = (List<Integer>) recordDateAndWorkInfo.get(minExpMdate).get("workIndexList");

                int temp = 0;
                for (Integer index : workIndexList) {
                    result.add(getRealExpEdate(workGroup.get(index - temp)));
                    workGroup.remove(index - temp);
                    temp++;
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return result;
    }

    private Map getRealExpEdate(Map map) {
        WorkStatus workStatus = WorkStatus.findFirst("work_id = ? ", map.get("work_id").toString());
        if (workStatus == null)
            return map;
        if (workStatus.getString("is_close").equals("Y"))
            map.put("exp_Edate", sdf.format(workStatus.getDate("modify_time")));
        return map;
    }

    private void setErroInfo(Map workMap, String errorColume) {
        workMap.put(errorColume, errorStr);
        workMap.put("power_millisecond", errorStr);
        workMap.put("operate_millisecond", errorStr);
        workMap.put("cutting_millisecond", errorStr);
        workMap.put("downtime", errorStr);
        workMap.put("utilization", errorStr);
        workMap.put("effective_utilization", errorStr);
        workMap.put("part_count", errorStr);
        workMap.put("part_count_diff", errorStr);
        workMap.put("completion_percentage", errorStr);
        workMap.put("workshift_millisecond", errorStr);
    }

    private void setUtilizationEnptyValue(Map enptyWork) {
        enptyWork.put("power_millisecond", 0);
        enptyWork.put("operate_millisecond", 0);
        enptyWork.put("cutting_millisecond", 0);
        enptyWork.put("downtime", 0);
        enptyWork.put("utilization", 0);
        enptyWork.put("effective_utilization", 0);
        enptyWork.put("workshift_millisecond", 0);
    }

    private void setPartCountEnptyValue(Map enptyWork) {
        enptyWork.put("part_count", 0);
        enptyWork.put("part_count_diff", 0 - (Long) enptyWork.get("work_qty"));
        enptyWork.put("completion_percentage", 0);
    }

    private String getWhere(String startDate, String endDate, String workId, String status, Object[] machineList) {
        StringBuffer sb = new StringBuffer("SELECT work_id,product_id,product_name,machine_id,program_name,exp_mdate,exp_edate,work_qty,is_close FROM a_jinfu_view_work_status_work WHERE 1=1 ");
//        if (startDate != null && !startDate.equals("")) {
//            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
//            String startStr = startDate.replace('/', '-') + " 00:00:00";
//            String endStr = endDate.replace('/', '-') + " 23:59:59";
//            sb.append(" and exp_mdate <= '");
//            sb.append(endStr);
//            sb.append("' ");
////            sb.append(" and (exp_edate >= '");
////            sb.append(startStr);
////            sb.append("' AND ");
////            sb.append("exp_mdate <= '");
////            sb.append(endStr);
////            sb.append("') ");
//        }
//        if (status != null && !status.equals("all")) {
//            sb.append(" and is_close = '");
//            switch (status.toString()) {
//                case "unclose":
//                    sb.append("N");
//                    break;
//                case "closed":
//                    sb.append("Y");
//                    break;
//            }
//            sb.append("' ");
//        }
//        if (workId != null && !workId.equals("")) {
//            sb.append(" and work_id LIKE '");
//            sb.append(workId);
//            sb.append("%' ");
//        }
        if (machineList != null && machineList.length != 0) {
            sb.append(" and machine_id in (");
            for (int i = 0; i < machineList.length; i++) {
                sb.append("'");
                sb.append(machineList[i].toString());
                sb.append("'");
                if (i + 1 != machineList.length) {
                    sb.append(",");
                }
            }
            sb.append(") ");
        }
        sb.append(" order by work_id");
        System.out.println("sql : " + sb.toString());
        return sb.toString();
    }

    private static double formatPercentage(Long numerator, Long denominator) {
        double result;
        if (numerator != 0L && denominator != 0L) {
            double perc = (double) numerator / denominator;
            BigDecimal b = new BigDecimal(perc);
            return b.setScale(4, RoundingMode.HALF_UP).doubleValue();
        } else {
            result = 0.0;
        }
        return result;
    }
}
