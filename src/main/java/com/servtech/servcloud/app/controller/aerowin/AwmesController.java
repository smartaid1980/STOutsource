package com.servtech.servcloud.app.controller.aerowin;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2016/10/18.
 */

@RestController
@RequestMapping("/aerowin/awmes")
public class AwmesController {
    private final Logger log = LoggerFactory.getLogger(AwmesController.class);

    private final String DATE_FORMAT = "yyyy-MM-dd";
    private final String TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private final String YM_FORMAT = "yyyyMM";

    private final String START_TIME = "00:00:00";
    private final String END_TIME = "23:59:59";

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/updateShiftDate", method = GET)
    public RequestResult<String> updateShiftDate() {
        String dateStr = AerowinUtil.date2str(new Date(), DATE_FORMAT);
        Date endDate = AerowinUtil.str2date(dateStr, DATE_FORMAT);//當天
        Date startDate = AerowinUtil.addDay(endDate, -1);//前一天
        return findShiftDate(startDate, endDate);
    }

    @RequestMapping(value = "/updateShiftDateByRange", method = GET)
    public RequestResult<String> updateShiftDateByRange(
            @RequestParam("startDate") final Date startDate,
            @RequestParam("endDate") final Date endDate
    ) {
        return findShiftDate(startDate, endDate);
    }

    private RequestResult<String> findShiftDate(final Date startDate, final Date endDate){
        final Map<String, AerowinUtil.Employee> employeeMap = AerowinUtil.initEmployeeMap();
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                List<Date> range = AerowinUtil.getDateList(startDate, endDate);
                for(Date date:range){
                    String dateStr = AerowinUtil.date2str(date, DATE_FORMAT);
                    Date startTime = AerowinUtil.str2date(dateStr + " " + START_TIME, TIME_FORMAT);
                    Date endTime = AerowinUtil.str2date(dateStr + " " + END_TIME, TIME_FORMAT);
                    calcShiftDate(startTime, endTime, employeeMap);
                }
                return success();
            }
        });
    }

    private void calcShiftDate(Date startTime, Date endTime, Map<String, AerowinUtil.Employee> employeeMap){
        log.info("range - {} ~ {}",
                AerowinUtil.date2str(startTime, TIME_FORMAT),
                AerowinUtil.date2str(endTime, TIME_FORMAT));
        List<Map> awmesMaps = Base.findAll(
                "SELECT aaa.id, aaa.emp_id, aaa.mes_time, aaa.shift_date FROM a_aerowin_awmes aaa" +
                        " WHERE aaa.mes_time BETWEEN ? AND ?", startTime, endTime);
        for(Map awmesMap:awmesMaps){
            Long id = (Long) awmesMap.get("id");
            String empId = awmesMap.get("emp_id").toString();
            Date mesTime = (Date) awmesMap.get("mes_time");

            String ym = AerowinUtil.date2str(mesTime, YM_FORMAT);
            String key = ym + "@" + empId;
            AerowinUtil.Employee employee;
            if(employeeMap.containsKey(key)){
                employee = employeeMap.get(key);
            }else{
                employee = AerowinUtil.defaultEmployee(mesTime, empId);
                if(!empId.equals("Administrator")){
                    log.warn("*** not find ym: {}, empId: {}", ym, empId);
                }
            }
            Date shiftDate = employee.findShiftDate(mesTime);
            Base.exec("UPDATE a_aerowin_awmes SET shift_date = ? WHERE id = ?", shiftDate, id);
        }
    }
}
