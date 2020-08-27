package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.servcloud.app.model.yihcheng.Employee;
import com.servtech.servcloud.app.model.yihcheng.InvalidLineStatusLog;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingEmployee;
import com.servtech.servcloud.app.model.yihcheng.view.WorkTrackingForProductionDailyReport;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/yihcheng/daily-produce")
public class YihChengProduceDailyController {

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    private static SimpleDateFormat yyyyMMddHHmmss = new SimpleDateFormat("yyyyMMddHHmmss");
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @RequestMapping(value = "by-work", method = RequestMethod.POST)
    public RequestResult<?> byWork(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String queryStart = data.get("startDate").toString();
                String queryEnd = data.get("endDate").toString();
                List<String> processCodesList = (List<String>) data.get("processCodes");
                List<String> productIdList = data.get("product_id") == null ? null : (List<String>) data.get("product_id");
                List<String> divisionIdList = (List<String>) data.get("division_id");


                String whereSql = getWhereSql(queryStart, queryEnd, processCodesList, productIdList, divisionIdList);
                List<Map> workTrackingForProductionDailyReportList = WorkTrackingForProductionDailyReport.findBySQL(whereSql).toMaps();
                return success(workTrackingForProductionDailyReportList);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "by-process", method = RequestMethod.POST)
    public RequestResult<?> byProcess(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String queryStart = data.get("startDate").toString();
                String queryEnd = data.get("endDate").toString();
                List<String> processCodesList = (List<String>) data.get("processCodes");
                List<String> productIdList = data.get("product_id") == null ? null : (List<String>) data.get("product_id");
                List<String> divisionIdList = (List<String>) data.get("division_id");


                String whereSql = getWhereSql(queryStart, queryEnd, processCodesList, productIdList, divisionIdList);
                List<Map> workTrackingForProductionDailyReportList = WorkTrackingForProductionDailyReport.findBySQL(whereSql).toMaps();
                for (Map map : workTrackingForProductionDailyReportList) {
                    String move_in = map.get("move_in").toString();
                    String move_out = map.get("move_out").toString();
                    String device_id = map.get("device_id") == null ? null : map.get("device_id").toString();
                    String line_id = map.get("line_id").toString();
                    String work_id = map.get("work_id").toString();
                    String op = map.get("op").toString();
                    List<WorkTrackingEmployee> workTrackingEmployeeList = WorkTrackingEmployee.find("move_in = ? and line_id = ? and work_id = ? and op = ?", move_in, line_id, work_id, op);
                    map.put("number_of_tracking", workTrackingEmployeeList.size());
                    map.put("tracking_emp_names", getTrackingEmpNames(workTrackingEmployeeList));

                    if(device_id != null){
//                        List<InvalidLineStatusLog> invalidLineStatusLogList = InvalidLineStatusLog.find("move_in = ? and line_id = ? and work_id = ? and op = ?", move_in, line_id, work_id, op);
//                        Map result = getMachineOperationTimeAndOutPut(move_in, move_out, device_id, invalidLineStatusLogList);
                        map.put("machine_operation_time", map.get("run_time"));
                        map.put("machine_output", map.get("qty_iot"));
                    }
                }
                return success(workTrackingForProductionDailyReportList);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    private Map getMachineOperationTimeAndOutPut(String move_in, String move_out, String device_id, List<InvalidLineStatusLog> invalidLineStatusLogList) {
        Map result = new HashMap();
        Hippo hippo = HippoService.getInstance();

        String moveIn8Bit = move_in.replace("-","").substring(0,8);
        String moveOut8Bit = move_out.replace("-","").substring(0,8);
        try {
            Date moveInDate = sdf.parse(move_in);
            Date moveOutDate = sdf.parse(move_out);
            List<Map<String, Atom>> part_count_list = hippo.newSimpleExhaler().space("part_count_marged").index("machine_id", new String[]{device_id}).indexRange("date", moveIn8Bit, moveOut8Bit)
                    .columns("first_timestamp", "last_on_timestamp", "operate_millisecond").exhale().get().toMapping();

            boolean is_first = true;
            long first_part_count = 0;
            long pre_part_count = 0;
            long final_part_count = 0;
            long final_operation_time = 0;
            for(Map<String, Atom> map : part_count_list){

                String first_timestamp = map.get("first_timestamp").asString().substring(0,14);
                Date firstTimestampDate = yyyyMMddHHmmss.parse(first_timestamp);
                String last_on_timestamp = map.get("last_on_timestamp").asString().substring(0,14);
                Date lastOnTimestampDate = yyyyMMddHHmmss.parse(last_on_timestamp);
                if(moveOutDate.before(firstTimestampDate))
                    break;

                if((moveInDate.before(lastOnTimestampDate) || moveInDate == lastOnTimestampDate ) && (moveOutDate.after(firstTimestampDate) || moveInDate == firstTimestampDate)){

                    final_operation_time += map.get("operate_millisecond").asLong();
                    long part_count = map.get("part_count").asLong();

                    if(is_first){
                        first_part_count = part_count;
                        is_first = false;
                    }

                    if(part_count < pre_part_count){
                        final_part_count += pre_part_count - first_part_count;
                        first_part_count = part_count;
                    }
                    pre_part_count = part_count;
                }
            }
            final_part_count += pre_part_count - first_part_count;
            result.put("machine_output", final_part_count);
            result.put("machine_operation_time", final_operation_time);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return result;
    }

    private Object getTrackingEmpNames(List<WorkTrackingEmployee> workTrackingEmployeeList) {
        StringJoiner sj = new StringJoiner(",");
        for (WorkTrackingEmployee emp : workTrackingEmployeeList) {
            String emp_name = Employee.findById(emp.getString("employee_id")).getString("emp_name");
            sj.add(emp_name);
        }
        return sj.toString();
    }

    private String getWhereSql(String queryStart, String queryEnd, List<String> processCodesList, List<String> productIdList, List<String> divisionIdList) {
        StringBuilder processCodeSB = listToSQLStr(processCodesList);
        StringBuilder productIdsSB = listToSQLStr(productIdList);
        StringBuilder divisionIdsSB = listToSQLStr(divisionIdList);

        StringBuilder sb = new StringBuilder("SELECT * FROM a_yihcheng_view_work_tracking_for_production_daily_report WHERE ");
        sb.append("shift_day >= '").append(queryStart).append("' and shift_day <= '").append(queryEnd)
                .append("' and process_code IN ").append(processCodeSB.toString())
                .append(" and division_id IN ").append(divisionIdsSB.toString());
        if (productIdsSB != null) {
            sb.append(" and product_id IN ").append(productIdsSB.toString());
        }
        return sb.toString();
    }

    private StringBuilder listToSQLStr(List<String> listInfo) {
        if (listInfo == null)
            return null;
        StringBuilder sb = new StringBuilder("(");
        for (int i = 0; i < listInfo.size(); i++) {
            sb.append("\'" + listInfo.get(i) + "\'");
            if (i != listInfo.size() - 1)
                sb.append(",");
        }
        sb.append(")");
        return sb;
    }
}
