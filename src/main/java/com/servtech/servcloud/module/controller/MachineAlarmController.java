package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.*;
import com.servtech.servcloud.module.util.CRUD_TYPE;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

/**
 * Created by Kevin Big Big on 2016/5/5.
 */

@RestController
@RequestMapping("/machinealarm")
public class MachineAlarmController {
    private static final Logger log = LoggerFactory.getLogger(MachineAlarmController.class);

    private static final String INPUT_DATE_FORMAT = "yyyy/MM/dd";
    private static final String OUTPUT_DATE_FORMAT = "yyyy-MM-dd";
    private static final String INPUT_MONTH_FORMAT = "yyyy/MM";
    private static final String OUTPUT_MONTH_FORMAT = "yyyy-MM";
    private static final String YEAR_FORMAT = "yyyy";

    private static final int NO_CLEAR_ALARM = 0; //未排除
    private static final int CLEAR_ALARM = 1; //已排除
    private static final int NO_NEED_CLEAR_ALARM = 2; //不需要排除

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/createByMachineIdAndAlarmId", method = POST)
    public RequestResult<?> createByMachineIdAndAlarmId(@RequestBody final Map data) {
        data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("create_time", new Timestamp(System.currentTimeMillis()));
        Map machineInfo =  getInfoByMachineId(data);
        if(machineInfo.containsKey("machine_id")){
            if(hasAlarmCode(data)){
                if(!hasAlarmCodeAndSourceOne(data)){//此alarm不需要故障排除
                    data.put("clear_status", NO_NEED_CLEAR_ALARM);//不需要排除
                }
                RequestResult<String> result = autoCreatePkAndInserOrUpdateData(data, CRUD_TYPE.CREATE);
                if(result.getType() == RequestResult.TYPE_SUCCESS){
                    Map resultMap = new HashMap();
                    String logId = result.getData();
                    resultMap.put("log_id", logId);
                    resultMap.put("app_id", "AlarmClear");
                    resultMap.put("alarm_clear_page", "01_alarm_clear_troubleshooting");
                    return success(resultMap);
                }else{
                    return result;
                }
            }else{//alarm code不存在
                return fail("this machineId: " + data.get("machine_id") + ", alarm code: " + data.get("alarm_id") + " not exist!");
            }
        }else{//無此機台
            return fail("this machineId not exist: " + data.get("machine_id"));
        }
    }

    private Map getInfoByMachineId(final Map data){
        return ActiveJdbc.operTx(new Operation<Map>() {
            @Override
            public Map operate() {
                Date currentTime = new Date();
                String machineId = data.get("machine_id").toString();
                List<Map> machines = Base.findAll(
                        "SELECT d.device_id, d.device_name AS machine_name, d.device_type AS machine_type_id, dcb.cnc_id FROM m_device d" +
                                " LEFT JOIN m_device_cnc_brand dcb ON d.device_id = dcb.device_id" +
                                " WHERE d.device_id = ?", machineId);
                if (machines.size() > 0) {
                    Map machine = machines.get(0);
                    data.put("machine_type_id", machine.get("machine_type_id"));
                    data.put("cnc_id", machine.get("cnc_id"));
                    data.put("occur_time", currentTime);//使用目前時間當作發生時間
                    data.put("occur_date", currentTime);//使用目前時間當作發生日期
                    data.put("clear_status", NO_CLEAR_ALARM);//排除狀態:0表示未排除
                    return data;
                } else {
                    return new HashMap();
                }
            }
        });
    }

    //DB有此alarm code
    private Boolean hasAlarmCode(final Map data){
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                List<Map> alarms = Base.findAll(
                        "SELECT * FROM m_alarm a" +
                                " WHERE a.alarm_id = ? AND a.cnc_id = ? AND a.machine_type_id = ?"
                        , data.get("alarm_id"), data.get("cnc_id"), data.get("machine_type_id"));
                if (alarms.size() > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    //source '1': 表示有需要做故障排除
    private Boolean hasAlarmCodeAndSourceOne(final Map data){
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                List<Map> alarms = Base.findAll(
                        "SELECT * FROM m_alarm a" +
                                " WHERE a.source = '1' AND a.alarm_id = ? AND a.cnc_id = ? AND a.machine_type_id = ?"
                        , data.get("alarm_id"), data.get("cnc_id"), data.get("machine_type_id"));
                if (alarms.size() > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    @RequestMapping(value = "/updateAleadyExcludedByLogId", method = PUT)
    public RequestResult<String> updateAleadyExcludedByLogId(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String logId = data.get("logId").toString();
                MachineAlarm machineAlarm = MachineAlarm.findById(logId);
                if (machineAlarm.exists()) {
                    Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                    machineAlarm.set("clear_status", CLEAR_ALARM);//排除
                    machineAlarm.set("clear_time", currentTime);//排除時間使用目前的時間點
                    machineAlarm.set("clear_date", currentTime);//排除日期使用目前的時間點
                    machineAlarm.set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    machineAlarm.set("modify_time", currentTime);
                    if (machineAlarm.saveIt()) {
                        return success(data.get("logId").toString());
                    } else {
                        return fail("updateAleadyExcludedByLogId fail...");
                    }
                } else {
                    return fail("this log id not find: " + logId);
                }
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
        return autoCreatePkAndInserOrUpdateData(data, CRUD_TYPE.UPDATE);
    }

    @RequestMapping(value = "/readMachineAlarmInfo", method = GET)
    public RequestResult<List<Map>> readMachineAlarmInfo() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT ma.*, d.device_name AS machine_name, a.alarm_status, a.description FROM m_machine_alarm ma" +
                                " LEFT JOIN m_device d ON ma.machine_id = d.device_id" +
                                " LEFT JOIN m_alarm a ON ma.alarm_id = a.alarm_id AND ma.cnc_id = a.cnc_id AND d.device_type = a.machine_type_id" +
                                " ORDER BY ma.occur_time DESC");
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readMachineAlarmInfoForAlarmClearByLogId", method = GET)
    public RequestResult<List<Map>> readMachineAlarmInfoForAlarmClearByLogId(@RequestParam final String logId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT ma.*, d.device_name AS machine_name, a.alarm_status, a.description FROM m_machine_alarm ma" +
                                " LEFT JOIN m_device d ON ma.machine_id = d.device_id" +
                                " LEFT JOIN m_alarm a ON ma.alarm_id = a.alarm_id AND ma.cnc_id = a.cnc_id AND d.device_type = a.machine_type_id" +
                                " WHERE ma.log_id = ?", logId);
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readByCncId", method = GET)
    public RequestResult<List<Map>> readByCncId(@RequestParam final String cncId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT ma.*, d.device_name AS machine_name, a.alarm_status, a.description FROM m_machine_alarm ma" +
                                " LEFT JOIN m_device d ON ma.machine_id = d.device_id" +
                                " LEFT JOIN m_alarm a ON ma.alarm_id = a.alarm_id AND ma.cnc_id = a.cnc_id AND d.device_type = a.machine_type_id" +
                                " WHERE ma.cnc_id = ?" +
                                " ORDER BY ma.occur_time ASC", cncId);
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readByCncIdAndClearStatus", method = GET)
    public RequestResult<List<Map>> readByCncIdAndClearStatus(
            @RequestParam final String cncId,
            @RequestParam final String clearStatus) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT ma.*, d.device_name AS machine_name, a.alarm_status, a.description FROM m_machine_alarm ma" +
                                " LEFT JOIN m_device d ON ma.machine_id = d.device_id" +
                                " LEFT JOIN m_alarm a ON ma.alarm_id = a.alarm_id AND ma.cnc_id = a.cnc_id AND d.device_type = a.machine_type_id" +
                                " WHERE ma.cnc_id = ? AND ma.clear_status = ?" +
                                " ORDER BY ma.occur_time ASC", cncId, clearStatus);
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readByClearStatus", method = GET)
    public RequestResult<List<Map>> readByClearStatus(@RequestParam final String clearStatus) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Base.findAll(
                        "SELECT ma.*, d.device_name AS machine_name, a.alarm_status, a.description FROM m_machine_alarm ma" +
                                " LEFT JOIN m_device d ON ma.machine_id = d.device_id" +
                                " LEFT JOIN m_alarm a ON ma.alarm_id = a.alarm_id AND ma.cnc_id = a.cnc_id AND d.device_type = a.machine_type_id" +
                                " WHERE ma.clear_status = ?" +
                                " ORDER BY ma.occur_time ASC", clearStatus);
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/alarmClearProbabilityByDateRange", method = GET)
    public RequestResult<List<Map>> alarmClearProbabilityByDateRange(@RequestParam final String startDate, @RequestParam final String endDate) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat format = new SimpleDateFormat(OUTPUT_DATE_FORMAT);
                List<Map> result = new ArrayList<Map>();
                List<Date> dates = getDateList(startDate, endDate);
                Date preDate = null;
                for(Date date:dates){
                    Date currentDate = date;
                    if(preDate != null){
                        List<Map> allClearCount = Base.findAll(
                                "SELECT COUNT(*) AS all_clear_count FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status IN ('0', '1') AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        //發生日期和排除日期要同一天才算有排除
                        List<Map> thatDateClearCount = Base.findAll(
                                "SELECT COUNT(*) AS that_date_clear_count  FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status = '1' AND ma.occur_date = ma.clear_date AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        int total = Integer.parseInt(allClearCount.get(0).get("all_clear_count").toString());
                        int clearCount = Integer.parseInt(thatDateClearCount.get(0).get("that_date_clear_count").toString());
                        int noClearCount = total - clearCount;
                        //System.out.println("pre:" + format.format(preDate) + ", current:" + format.format(currentDate));
                        String dateStr = format.format(preDate);
                        Map ele = new HashMap();
                        ele.put("date", dateStr);
                        ele.put("total", total);
                        ele.put("clear_count", clearCount);//排除個數
                        ele.put("no_clear_count", noClearCount);//未排除個數
                        if(total == 0){//避免零除
                            ele.put("clear_probability", 0d);//排除率
                        }else{
                            ele.put("clear_probability", ((double) clearCount / (double) total));//排除率
                        }
                        result.add(ele);
                    }
                    preDate = currentDate;
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/alarmClearProbabilityByMonth", method = GET)
    public RequestResult<List<Map>> alarmClearProbabilityByMonth(@RequestParam final String month) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat format = new SimpleDateFormat(OUTPUT_DATE_FORMAT);
                List<Map> result = new ArrayList<Map>();
                List<Date> dates = getMonthDateList(month);
                Date preDate = null;
                for(Date date:dates){
                    Date currentDate = date;
                    if(preDate != null){
                        List<Map> allClearCount = Base.findAll(
                                "SELECT COUNT(*) AS all_clear_count FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status IN ('0', '1') AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        //發生日期和排除日期要同一天才算有排除
                        List<Map> thatDateClearCount = Base.findAll(
                                "SELECT COUNT(*) AS that_date_clear_count  FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status = '1' AND ma.occur_date = ma.clear_date AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        int total = Integer.parseInt(allClearCount.get(0).get("all_clear_count").toString());
                        int clearCount = Integer.parseInt(thatDateClearCount.get(0).get("that_date_clear_count").toString());
                        int noClearCount = total - clearCount;
                        //System.out.println("pre:" + format.format(preDate) + ", current:" + format.format(currentDate));
                        String dateStr = format.format(preDate);
                        Map ele = new HashMap();
                        ele.put("date", dateStr);
                        ele.put("total", total);
                        ele.put("clear_count", clearCount);//排除個數
                        ele.put("no_clear_count", noClearCount);//未排除個數
                        if(total == 0){//避免零除
                            ele.put("clear_probability", 0d);//排除率
                        }else{
                            ele.put("clear_probability", ((double) clearCount / (double) total));//排除率
                        }
                        result.add(ele);
                    }
                    preDate = currentDate;
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/alarmClearProbabilityByYear", method = GET)
    public RequestResult<List<Map>> alarmClearProbabilityByYear(@RequestParam final String year) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat format = new SimpleDateFormat(OUTPUT_MONTH_FORMAT);
                List<Map> result = new ArrayList<Map>();
                List<Date> dates = getYearDates(year);
                Date preDate = null;
                for(Date date:dates){
                    Date currentDate = date;
                    if(preDate != null){
                        List<Map> allClearCount = Base.findAll(
                                "SELECT COUNT(*) AS all_clear_count FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status IN ('0', '1') AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        //發生日期和排除日期要同一天才算有排除
                        List<Map> thatDateClearCount = Base.findAll(
                                "SELECT COUNT(*) AS that_date_clear_count  FROM m_machine_alarm ma" +
                                        " WHERE ma.clear_status = '1' AND ma.occur_date = ma.clear_date AND ma.occur_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        int total = Integer.parseInt(allClearCount.get(0).get("all_clear_count").toString());
                        int clearCount = Integer.parseInt(thatDateClearCount.get(0).get("that_date_clear_count").toString());
                        int noClearCount = total - clearCount;
                        //System.out.println("pre:" + format.format(preDate) + ", current:" + format.format(currentDate));
                        String dateStr = format.format(preDate);
                        Map ele = new HashMap();
                        ele.put("date", dateStr);
                        ele.put("total", total);
                        ele.put("clear_count", clearCount);//排除個數
                        ele.put("no_clear_count", noClearCount);//未排除個數
                        if(total == 0){//避免零除
                            ele.put("clear_probability", 0d);//排除率
                        }else{
                            ele.put("clear_probability", ((double) clearCount / (double) total));//排除率
                        }
                        result.add(ele);
                    }
                    preDate = currentDate;
                }
                return success(result);
            }
        });
    }

    private List<Date> getDateList(String startDate, String endDate){
        SimpleDateFormat format = new SimpleDateFormat(INPUT_DATE_FORMAT);
        Date start, end;
        try {
            start = format.parse(startDate);
            end = format.parse(endDate);
            return getDateList(start, end);
        } catch (ParseException e) {
            log.warn("date format error: {}, {}", startDate, endDate);
        }
        return new ArrayList<Date>();
    }

    private List<Date> getDateList(Date startDate, Date endDate){
        List<Date> dateList = new ArrayList<Date>();
        Calendar cal = Calendar.getInstance();
        dateList.add(startDate);
        while(endDate.compareTo(startDate) > 0){
            cal.setTime(startDate);
            cal.add(Calendar.DAY_OF_MONTH, 1);
            dateList.add(cal.getTime());
            startDate = cal.getTime();
        }
        //最後在加1天(因為需要使用下一天的資料去比較)
        cal.add(Calendar.DAY_OF_MONTH, 1);
        dateList.add(cal.getTime());
        return dateList;
    }

    private List<Date> getMonthDateList(String month){
        Date start = str2Month(month);
        Date end = str2MonthLastDay(month);
        return getDateList(start, end);
    }

    //月份中第一天
    private Date str2Month(String month){
        if(month == null){
            return null;
        }
        SimpleDateFormat format = new SimpleDateFormat(INPUT_MONTH_FORMAT);
        try {
            return format.parse(month);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }
    //月份中最後一天
    private Date str2MonthLastDay(String month){
        if(month == null){
            return null;
        }
        SimpleDateFormat format = new SimpleDateFormat(INPUT_MONTH_FORMAT);
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(format.parse(month));
            int lastDate = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
            calendar.add(Calendar.DATE, (lastDate - 1));
            return calendar.getTime();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    private List<Date> getYearDates(String year){
        List<Date> dateList = new ArrayList<Date>();
        Date yearDate = str2Year(year);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(yearDate);// 該年1月1號
        dateList.add(calendar.getTime());
        for(int index=0; index<12; index++){//要多一月，所以要再跑12次，加上前面加的一月
            calendar.add(Calendar.MONTH, 1);
            dateList.add(calendar.getTime());
        }
        return dateList;
    }

    private Date str2Year(String year){
        if(year == null){
            return null;
        }
        SimpleDateFormat format = new SimpleDateFormat(YEAR_FORMAT);
        try {
            return format.parse(year);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    @RequestMapping(value = "/alarmClearProbabilityByAlarmRange", method = GET)
    public RequestResult<?> alarmClearProbabilityByAlarmRange(
            @RequestParam final String type, @RequestParam(value="params[]") final String[] params) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> result = new ArrayList<Map>();
                Date startDate, endDate;
                if(type.equals("range")){
                    startDate = str2Date(params[0]);
                    endDate = str2Date(params[1]);
                }else if(type.equals("month")){
                    startDate = str2Month(params[0]);
                    endDate = str2MonthLastDay(params[0]);
                }else if(type.equals("year")){
                    startDate = str2Year(params[0]);
                    endDate = str2YearLastDay(params[0]);
                }else{
                    return fail("this type not find: " + type);
                }
                endDate = dateSet235959(endDate);//end date要到當日的23:59:59
                List<Map> allClearCount = Base.findAll(
                        "SELECT ma.alarm_id, ma.cnc_id, ma.machine_type_id, count(*) AS all_clear_count FROM m_machine_alarm ma" +
                                " WHERE ma.clear_status IN ('0', '1') AND ma.occur_time BETWEEN ? AND ?" +
                                " GROUP BY ma.alarm_id, ma.cnc_id, ma.machine_type_id"
                        , startDate, endDate);
                //發生日期和排除日期要同一天才算有排除
                List<Map> thatDateClearCount = Base.findAll(
                        "SELECT ma.alarm_id, ma.cnc_id, ma.machine_type_id, count(*) AS that_date_clear_count FROM m_machine_alarm ma" +
                                " WHERE ma.clear_status = '1' AND ma.occur_date = ma.clear_date AND ma.occur_time BETWEEN ? AND ?" +
                                " GROUP BY ma.alarm_id, ma.cnc_id, ma.machine_type_id"
                                , startDate, endDate);
                Map<String, AlarmClearProbabilityByAlarm> alarmMap = new HashMap<String, AlarmClearProbabilityByAlarm>();
                for(Map allClear:allClearCount){//初始化
                    AlarmClearProbabilityByAlarm alarmClearProbabilityByAlarm = new AlarmClearProbabilityByAlarm(
                            allClear.get("alarm_id").toString(),
                            allClear.get("cnc_id").toString(),
                            allClear.get("machine_type_id").toString(),
                            allClear.get("all_clear_count").toString()
                    );
                    alarmMap.put(alarmClearProbabilityByAlarm.getKey(), alarmClearProbabilityByAlarm);
                }
                for(Map thatClear:thatDateClearCount){//計算排除率
                    String alarmId = thatClear.get("alarm_id").toString();
                    String cncId = thatClear.get("cnc_id").toString();
                    String machineTypeId = thatClear.get("machine_type_id").toString();
                    String key = alarmId + cncId + machineTypeId;
                    if(alarmMap.containsKey(key)){
                        alarmMap.get(key).setClearCount(thatClear.get("that_date_clear_count").toString());
                    }
                }
                for(Map.Entry<String, AlarmClearProbabilityByAlarm> alarm:alarmMap.entrySet()){
                    result.add(alarm.getValue().toMap());
                }
                return success(result);
            }
        });
    }

    private Date dateSet235959(Date date){
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.HOUR_OF_DAY, 23);
        calendar.add(Calendar.MINUTE, 59);
        calendar.add(Calendar.SECOND, 59);
        return calendar.getTime();
    }

    private class AlarmClearProbabilityByAlarm{
        private String key;

        private String alarmId;
        private String cncId;
        private String machineTypeId;

        private int total;
        private int clearCount;//排除個數
        private int noClearCount;//未排除個數
        private double clearProbability;//排除率

        public AlarmClearProbabilityByAlarm(String alarmId, String cncId, String machineTypeId, String total){
            this.key = alarmId + cncId + machineTypeId;

            this.alarmId = alarmId;
            this.cncId = cncId;
            this.machineTypeId = machineTypeId;

            this.total = Integer.parseInt(total);
            this.clearCount = 0;
            this.noClearCount = Integer.parseInt(total);//避免已排除中無此alarm code，所以先預設好
            this.clearProbability = 0d;
        }

        public void setClearCount(String count){
            this.clearCount = Integer.parseInt(count);//排除數
            this.noClearCount = this.total - this.clearCount;//未排除數
            if(this.total > 0){//避免零除，所以要多判斷total是否大於零
                this.clearProbability = ((double) clearCount / (double) total);
            }
        }

        public Map toMap(){
            Map result = new HashMap();
            result.put("alarm_id", this.alarmId);
            result.put("cnc_id", this.cncId);
            result.put("machine_type_id", this.machineTypeId);
            result.put("total", this.total);
            result.put("clear_count", this.clearCount);
            result.put("no_clear_count", this.noClearCount);
            result.put("clear_probability", this.clearProbability);
            return result;
        }

        public String getKey() {
            return key;
        }

        public String getAlarmId() {
            return alarmId;
        }

        public String getCncId() {
            return cncId;
        }

        public String getMachineTypeId() {
            return machineTypeId;
        }

        public int getTotal() {
            return total;
        }

        public int getClearCount() {
            return clearCount;
        }

        public int getNoClearCount() {
            return noClearCount;
        }

        public double getClearProbability() {
            return clearProbability;
        }
    }

    private Date str2Date(String date){
        if((date == null) || (date.length() == 0)){
            return null;
        }
        SimpleDateFormat format = new SimpleDateFormat(INPUT_DATE_FORMAT);
        try {
            return format.parse(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    //一年中最後一天
    private Date str2YearLastDay(String year){
        if(year == null){
            return null;
        }
        SimpleDateFormat format = new SimpleDateFormat(YEAR_FORMAT);
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(format.parse(year));
            calendar.add(Calendar.YEAR, 1);
            calendar.add(Calendar.DATE, -1);
            return calendar.getTime();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(MachineAlarm.findAll().toMaps());
            }
        });
    }

    private RequestResult<String> autoCreatePkAndInserOrUpdateData(final Map data, final CRUD_TYPE crudType){
        return autoCreatePkAndInserOrUpdateData(data, crudType, 1);//第一次要設定db add index初始值
    }

    private RequestResult<String> autoCreatePkAndInserOrUpdateData(final Map data, final CRUD_TYPE crudType, final int dbAddIndex){
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    MachineAlarm machineAlarm = new MachineAlarm();
                    switch(crudType){
                        case CREATE:
                            DbMaxIndex dbMaxIndex = DbMaxIndex.findById("m_machine_alarm");
                            if(dbMaxIndex == null){
                                return fail("db_max_index not find pk 'm_machine_alarm'");
                            }
                            int nextIndex = dbMaxIndex.getInteger("max_index") + dbAddIndex;
                            data.put("log_id", String.format("%010d", nextIndex));// data.put("log_id", String.valueOf(nextIndex));
                            machineAlarm.fromMap(data);
                            if (machineAlarm.insert()) {//新增需要更新max_index
                                DbMaxIndex updateDbMaxIndex = DbMaxIndex.findById("m_machine_alarm");
                                updateDbMaxIndex.set("max_index", nextIndex);//更新index //updateDbMaxIndex.set("max_index", String.format("%010d", nextIndex));
                                updateDbMaxIndex.saveIt();
                                return success(machineAlarm.getString("log_id"));
                            } else {
                                return fail("create fail...");
                            }
                        case UPDATE:
                            machineAlarm.fromMap(data);
                            if (machineAlarm.saveIt()) {
                                return success(machineAlarm.getString("log_id"));
                            }else{
                                return fail("update fail...");
                            }
                        default:
                            log.warn("*** can not exec this type op: {}", crudType);
                            return fail("can not exec this type op: " + crudType);
                    }
                }
            });
        } catch (Exception e) {
            //很衰小的遇到pk重複，找好再做一次取號
            if(e.getMessage().contains("PRIMARY") && e.getMessage().contains("Duplicate")){
                log.info("m_machine_alarm Duplicate PRIMARY, so pk index + {}", dbAddIndex + 1);
                return autoCreatePkAndInserOrUpdateData(data, crudType, dbAddIndex + 1);//摸一該
            }else{
                log.error(e.getMessage());
                return fail("exception: " + e.getMessage());
            }
        }
    }
}
