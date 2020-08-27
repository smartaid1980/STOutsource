package com.servtech.servcloud.app.controller.huangliang;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.servtech.servcloud.app.model.huangliang.RepairEmpCheckIn;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2016/7/28.
 */
@RestController
@RequestMapping("/huangliang/repairEmpCheckIn")
public class HuangLiangRepairEmpCheckInController {

    private static final Logger logger = LoggerFactory.getLogger(HuangLiangRepairEmpCheckInController.class);
    private static final long ONE_DAY_IN_MILLIS = 86400000;
    private static final long THIRTY_MINUTE_IN_MILLIS = 1800000;

    @RequestMapping(value = "checkOut", method = RequestMethod.POST)
    public RequestResult<?> checkOut(@RequestBody final Map<String, String> data) {
        final String user_id = data.get("user_id");
        final String password = data.get("password");
        WorkShiftTimeService.NowActualShiftTime workShiftTimeService = WorkShiftTimeService.nowActualShiftTime();
        if (workShiftTimeService.getLogicallyDate8Bits().equals("")) {
            return fail("找不到所屬班次，目前非上班時間。");
        }

        final String nowWorkShiftName = workShiftTimeService.getNowShiftTime().get("name").toString();
        final String logicallyDate = workShiftTimeService.getLogicallyDate8Bits();

        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                //check if already checked in and have not checked out
                RepairEmpCheckIn repairEmpCheckInAlreadyCheckIn = RepairEmpCheckIn.findFirst(
                        " user_id = ? and logically_date = ? and work_shift_name = ? and check_out_tsp is null",
                        user_id, logicallyDate, nowWorkShiftName);

                if (repairEmpCheckInAlreadyCheckIn == null) {
                    return fail("人員於日期: " + logicallyDate + " 班次: " + nowWorkShiftName + "無未簽退之登入紀錄。");
                }

                //insert check in record
                SysUser sysUser = SysUser.findFirst(" user_id = ?", user_id);

                if (sysUser != null) {
                    String hashPwd = Hashing.md5().hashString(password, Charsets.UTF_8).toString();

                    if (hashPwd.equals(sysUser.getString("user_pwd"))) {

                        if (sysUser.getInteger("is_close") == 1) {

                            DateFormat formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                            String check_out_tsp = formatter.format(new Date());
                            try {
                                repairEmpCheckInAlreadyCheckIn.set("check_out_tsp", check_out_tsp);
                                repairEmpCheckInAlreadyCheckIn.saveIt();
                                Map<String, String> result = new HashMap<String, String>();
                                result.put("user_name", sysUser.get("user_name").toString());
                                result.put("msg", "簽退成功");
                                logger.info("維修人員: " + user_id + "於班次天: " + logicallyDate + "班次: " + nowWorkShiftName + "簽退");
                                return success(result);
                            } catch (Exception e) {
                                e.printStackTrace();
                                return fail("報到失敗...原因待查...");
                            }

                        } else {
                            return fail("帳號未啟用。");
                        }

                    } else {
                        return fail("人員密碼錯誤。");
                    }

                } else {
                    return fail("帳號不存在。");
                }
            }
        });
    }

    @RequestMapping(value = "checkIn", method = RequestMethod.POST)
    public RequestResult<?> checkIn(@RequestBody final Map<String, String> data) {

        final String user_id = data.get("user_id");
        final String password = data.get("password");
        final CheckInWorkShift checkinWorkShift = getCheckInWorkShift();

        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                if (checkinWorkShift == null) {
                    return fail("找不到所屬班次，請稍後再試。");
                }

                //check if already checked in
                RepairEmpCheckIn repairEmpCheckInAlreadyCheckIn = RepairEmpCheckIn.findFirst(
                        " user_id = ? and logically_date = ? and work_shift_name = ? and check_out_tsp <> null",
                        user_id, checkinWorkShift.logicallyDate, checkinWorkShift.work_shift_name);

                if (repairEmpCheckInAlreadyCheckIn != null) {
                    return fail("人員於日期: " + checkinWorkShift.logicallyDate + " 班次: " + checkinWorkShift.work_shift_name + "已登入過。");
                }

                //insert check in record
                SysUser sysUser = SysUser.findFirst(" user_id = ?", user_id);

                if (sysUser != null) {
                    String hashPwd = Hashing.md5().hashString(password, Charsets.UTF_8).toString();

                    if (hashPwd.equals(sysUser.getString("user_pwd"))) {

                        if (sysUser.getInteger("is_close") == 1) {

                            RepairEmpCheckIn repairEmpCheckIn = new RepairEmpCheckIn();
                            repairEmpCheckIn.set("logically_date", checkinWorkShift.logicallyDate);
                            repairEmpCheckIn.set("user_id", user_id);
                            repairEmpCheckIn.set("work_shift_name", checkinWorkShift.work_shift_name);
                            repairEmpCheckIn.set("check_in_tsp", checkinWorkShift.check_in_tsp);
                            repairEmpCheckIn.set("work_shift_start", checkinWorkShift.work_shift_start);
                            repairEmpCheckIn.set("work_shift_end", checkinWorkShift.work_shift_end);
                            repairEmpCheckIn.set("work_shift_check_in_start", checkinWorkShift.work_shift_check_in_start);
                            repairEmpCheckIn.set("work_shift_check_in_end", checkinWorkShift.work_shift_check_in_end);
                            repairEmpCheckIn.set("is_dispatch", 0);

                            try {
                                if (repairEmpCheckIn.insert()) {
                                    Map<String, String> result = new HashMap<String, String>();
                                    result.put("user_name", sysUser.get("user_name").toString());
                                    result.put("msg", "報到成功");
                                    logger.info("維修人員: " + user_id + "於班次天: " + checkinWorkShift.logicallyDate +
                                            "班次: " + checkinWorkShift.work_shift_name + "報到");
                                    return success(result);
                                } else {
                                    return fail("報到失敗...原因待查...");
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                                return fail("報到失敗...原因待查...");
                            }

                        } else {
                            return fail("帳號未啟用。");
                        }

                    } else {
                        return fail("人員密碼錯誤。");
                    }

                } else {
                    return fail("帳號不存在。");
                }
            }
        });
    }

    @RequestMapping(value = "read", method = RequestMethod.POST)
    public RequestResult<?> read(@RequestParam(value = "start_date") final String start_date,
                                 @RequestParam(value = "end_date") final String end_date) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
                List<Map> repairEmpCheckInList = Base.findAll(
                        "SELECT hreci.*, su.user_name " +
                                "FROM a_huangliang_repair_emp_check_in as hreci " +
                                "LEFT JOIN m_sys_user as su " +
                                "on hreci.user_id = su.user_id " +
                                "where hreci.logically_date between ? and ?", start_date, end_date);
                for (Map map : repairEmpCheckInList) {
                    map.put("logically_date", dateFormat.format(map.get("logically_date")));
                }
                return success(repairEmpCheckInList);
            }
        });
    }

    @RequestMapping(value = "currentEmp", method = RequestMethod.GET)
    public RequestResult<List<Map>> currentEmp() {
        WorkShiftTimeService.NowActualShiftTime workShiftTime = WorkShiftTimeService.nowActualShiftTime();
        String date = workShiftTime.getLogicallyDate8Bits();
        final String dateSlashed = date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);
        final String workShiftName = (String) workShiftTime.getNowShiftTime().get("name");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> repairEmpCheckInList = Base.findAll(
                        "SELECT hreci.user_id, su.user_name " +
                                "FROM a_huangliang_repair_emp_check_in AS hreci " +
                                "LEFT JOIN m_sys_user AS su " +
                                "ON hreci.user_id = su.user_id " +
                                "WHERE hreci.logically_date between ? AND ? AND work_shift_name = ? AND check_out_tsp IS NULL", dateSlashed, dateSlashed, workShiftName);

                return success(repairEmpCheckInList);
            }
        });
    }

    private final CheckInWorkShift getCheckInWorkShift() {
        CheckInWorkShift checkInWorkShift = null;
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
        String yesterday = dateFormat.format(new Date().getTime() - ONE_DAY_IN_MILLIS);
        String tomorrow = dateFormat.format(new Date().getTime() + ONE_DAY_IN_MILLIS);
        Date checkInTsp = new Date();
        try {
            WorkShiftTimeService workShiftTimeService = new WorkShiftTimeService(yesterday, tomorrow);
            Map<String, List<Map<String, Object>>> intervalWorkShiftTimes = workShiftTimeService.getIntervalWorkShiftTimes();
            for (String logicallyDate : intervalWorkShiftTimes.keySet()) {
                for (Map<String, Object> workShift : intervalWorkShiftTimes.get(logicallyDate)) {
                    Date checkInStart = new Date(new Date(workShift.get("start").toString()).getTime() - THIRTY_MINUTE_IN_MILLIS);
                    Date checkInEnd = new Date(new Date(workShift.get("end").toString()).getTime() - THIRTY_MINUTE_IN_MILLIS);

                    if (checkInTsp.after(checkInStart) && checkInTsp.before(checkInEnd)) {
                        checkInWorkShift = new CheckInWorkShift(logicallyDate, checkInTsp, workShift.get("name"),
                                workShift.get("start"), workShift.get("end"), checkInStart, checkInEnd);
                    }
                }
            }
        } catch (WorkShiftTimeException e) {
            e.printStackTrace();
        }
        return checkInWorkShift;
    }

    private class CheckInWorkShift {
        String logicallyDate = "";
        String check_in_tsp = "";
        String work_shift_name = "";
        String work_shift_start = "";
        String work_shift_end = "";
        String work_shift_check_in_start = "";
        String work_shift_check_in_end = "";

        public CheckInWorkShift(String logicallyDate, Date check_in_tsp, Object work_shift_name,
                                Object work_shift_start, Object work_shift_end,
                                Date work_shift_check_in_start, Date work_shift_check_in_end) {
            DateFormat formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            this.logicallyDate = logicallyDate;
            this.check_in_tsp = formatter.format(check_in_tsp);
            this.work_shift_name = work_shift_name.toString();
            this.work_shift_start = work_shift_start.toString();
            this.work_shift_end = work_shift_end.toString();
            this.work_shift_check_in_start = formatter.format(work_shift_check_in_start);
            this.work_shift_check_in_end = formatter.format(work_shift_check_in_end);
        }

    }
}
