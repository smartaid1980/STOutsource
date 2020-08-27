package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.WorkShiftTime;
import org.javalite.activejdbc.LazyList;
import org.javalite.activejdbc.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/huangliangMatStock/non_production")
public class NonProductionController {

    @Autowired
    private HttpServletRequest request;

    public static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    public static SimpleDateFormat yyyy_MM_dd = new SimpleDateFormat("yyyy-MM-dd");

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final List<String> dayOffList) {
        try {
            return ActiveJdbc.operTx(() -> {
                Set<Map> result = new HashSet<>();
                Calendar cal = Calendar.getInstance();

                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "NonProductionController" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Date now = new Date(System.currentTimeMillis());
                List<Device> deviceList = Device.findAll();
                List<WorkShiftTime> workShiftTimeList = WorkShiftTime.find("order by sequence");
                String start = workShiftTimeList.get(0).getString("start");
                String end = workShiftTimeList.get(workShiftTimeList.size() - 1).getString("end");
                try {

                    for (String dayOff : dayOffList) {
                        cal.setTime(sdf.parse(dayOff + " " + end));
                        cal.add(Calendar.DAY_OF_WEEK, 1);
                        boolean isInsertSuccess = true;

                        for (Device device : deviceList) {
                            NonProduction nonProduction = new NonProduction();
                            nonProduction
                                    .set("machine_id", device.getString("device_id"))
                                    .set("purpose", 9)
                                    .set("purpose_other", null)
                                    .set("exp_time", dayOff + " " + start)
                                    .set("exp_edate", cal.getTime())
                                    .set("day_off", dayOff)
                                    .set("status", 0)
                                    .set("create_by", user)
                                    .set("create_time", now)
                                    .set("modify_by", user)
                                    .set("modify_time", now);

                            try {
                                nonProduction.insert();
                            } catch (Exception e) {
                                isInsertSuccess = false;
                            }
                        }
                        if (isInsertSuccess) {
                            GetOverlapScheduling(result, dayOff + " " + start, sdf.format(cal.getTime()));
                        }
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                return RequestResult.success(result);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    private void GetOverlapScheduling(Set<Map> result, String exp_mdate, String exp_edate) throws ParseException {
        String productionSQL = getProductionSQL(exp_mdate, exp_edate);
        System.out.println(productionSQL);
        List<Map> productionSchedulingList = ProductionScheduling.findBySQL(productionSQL).toMaps();
        for (Map productionScheduling : productionSchedulingList) {
            productionScheduling.put("day_off", yyyy_MM_dd.parse(exp_mdate.substring(0, 10)));
            result.add(productionScheduling);
        }

        String woMStatusSQL = getWoMStatusSQL(exp_mdate, exp_edate);
        System.out.println(woMStatusSQL);
        List<Map> woMStatusList = WoMStatus.findBySQL(woMStatusSQL).toMaps();
        for (Map woMStatus : woMStatusList) {
            woMStatus.put("day_off", yyyy_MM_dd.parse(exp_mdate.substring(0, 10)));
            result.add(woMStatus);
        }
    }

    private String getWoMStatusSQL(String exp_mdate, String exp_edate) {
        return String.format("SELECT machine_id , order_id FROM a_huangliang_wo_m_status WHERE w_m_status = 0 and ((exp_mdate >= '%s' AND exp_mdate <= '%s') OR (exp_edate >= '%s' AND exp_edate <= '%s')) group by machine_id,order_id", exp_mdate, exp_edate, exp_mdate, exp_edate);
    }

    private String getProductionSQL(String exp_mdate, String exp_edate) {
        return String.format("SELECT machine_id , order_id FROM a_huangliang_production_scheduling WHERE schedule_status = 0 and ((exp_mdate >= '%s' AND exp_mdate <= '%s') OR (exp_edate >= '%s' AND exp_edate <= '%s')) group by machine_id,order_id", exp_mdate, exp_edate, exp_mdate, exp_edate);
    }

    @RequestMapping(method = RequestMethod.DELETE)
    public RequestResult<?> delete(@RequestBody final String dayOff) {
        try {
            return ActiveJdbc.operTx(() -> {
                Set<Map> result = new HashSet<>();
                try {

                    boolean isDeleteSuccess = false;
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "NonProductionController" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Date now = new Date(System.currentTimeMillis());

                    List<WorkShiftTime> workShiftTimeList = WorkShiftTime.find("order by sequence");
                    String start = workShiftTimeList.get(0).getString("start");
                    String end = workShiftTimeList.get(workShiftTimeList.size() - 1).getString("end");
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(sdf.parse(dayOff + " " + end));
                    cal.add(Calendar.DAY_OF_WEEK, 1);

                    List<NonProduction> nonProductionList = NonProduction.find("day_off = ?", dayOff);

                    for (NonProduction nonProduction : nonProductionList) {
                        NonProductionLog nonProductionLog = new NonProductionLog();
                        nonProductionLog.fromMap(nonProduction.toMap());
                        nonProductionLog.set("remove_by", user).set("remove_time", now);
                        boolean isSuccess = nonProductionLog.insert();
                        if (isSuccess)
                            isDeleteSuccess = nonProduction.delete();
                    }
                    if (isDeleteSuccess)
                        GetOverlapScheduling(result, dayOff + " " + start, sdf.format(cal.getTime()));
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                return RequestResult.success(result);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }
}
