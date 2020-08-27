package com.servtech.servcloud.app.controller.aerowin;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import org.javalite.activejdbc.Base;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Kevin Big Big on 2016/10/18.
 */
public class AerowinUtil {
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final String TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final String YM_FORMAT = "yyyyMM";

    private static final String SHIFT_A = "A";

    private static final String DEFAULT_SHIFT_BEGIN = "08:00";
    private static final String DEFAULT_SHIFT_END = "17:30";

    public static Map<String, Employee> initEmployeeMap(){
        return ActiveJdbc.operTx(new Operation<Map<String, Employee>>() {
            @Override
            public Map<String, Employee> operate() {
                //初始化Employee，之後用來歸日期和區間用
                //Map<ym@empId, Employee>
                Map<String, Employee> employeeMap = new HashMap<String, Employee>();
                List<Map> employeeTempMaps = Base.findAll("SELECT * FROM a_aerowin_employee aae");
                for (Map employeeTempMap : employeeTempMaps) {
                    String ym = employeeTempMap.get("ym").toString();
                    String empId = employeeTempMap.get("emp_id").toString();
                    String empName = employeeTempMap.get("emp_name").toString();
                    String shift = employeeTempMap.get("shift").toString();
                    String shiftBegin = employeeTempMap.get("shift_begin").toString();
                    String shiftEnd = employeeTempMap.get("shift_end").toString();
                    employeeMap.put(ym + "@" + empId, new Employee(ym, empId, empName, shift, shiftBegin, shiftEnd));
                }
                return employeeMap;
            }
        });
    }

    public static Employee defaultEmployee(Date ymDate, String empId){//無上傳excel的emp使用預設值
        String ym = date2str(ymDate, YM_FORMAT);
        return new AerowinUtil.Employee(ym, empId, "", SHIFT_A, DEFAULT_SHIFT_BEGIN, DEFAULT_SHIFT_END);
    }

    public static List<Date> getDateList(Date startDate, Date endDate){
        List<Date> dateList = new ArrayList<Date>();
        Calendar cal = Calendar.getInstance();
        dateList.add(startDate);
        while(endDate.compareTo(startDate) > 0){
            cal.setTime(startDate);
            cal.add(Calendar.DAY_OF_MONTH, 1);
            dateList.add(cal.getTime());
            startDate = cal.getTime();
        }
        return dateList;
    }

    public static Date addDay(Date date, int day){
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, day);
        return cal.getTime();
    }

    public static String date2str(Date date, String dateFormat){
        SimpleDateFormat format = new SimpleDateFormat(dateFormat);
        return format.format(date);
    }

    public static Date str2date(String date, String dateFormat){
        SimpleDateFormat format = new SimpleDateFormat(dateFormat);
        try {
            return format.parse(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }


    protected static class Employee{
        private static final int ADD_RANGE_HOUR = 4;
        private String ym;
        private String empId;
        private String empName;
        private String shift;//A, B, C
        private String shiftBegin;//08:00
        private String shiftEnd;//17:30

        public Employee(String ym, String empId, String empName, String shift, String shiftBegin, String shiftEnd) {
            this.ym = ym;
            this.empId = empId;
            this.empName = empName;
            this.shift = shift;
            this.shiftBegin = shiftBegin;
            this.shiftEnd = shiftEnd;
        }

        public Date findShiftDate(Date mesTime){//判斷要歸到哪一天
            String mesTimeStr = new SimpleDateFormat(TIME_FORMAT).format(mesTime);
            try {
                Date shiftDate = new SimpleDateFormat(DATE_FORMAT).parse(mesTimeStr);//2016-10-10
                String shiftDateStr = new SimpleDateFormat(DATE_FORMAT).format(shiftDate);//2016-10-10
                //TODO 歸哪一天的議題
                if(SHIFT_A.equals(this.shift)){//A班，不跨天，直接回傳天數
                    return shiftDate;
                }else{//B或C班，到隔天開始時間之前，都歸為前一天
                    Date startTime = new SimpleDateFormat(TIME_FORMAT).parse(
                            shiftDateStr + " " + this.shiftBegin + ":00");
                    Date endTime = new SimpleDateFormat(TIME_FORMAT).parse(
                            shiftDateStr + " " + this.shiftEnd + ":00");

                    //startTime = addHour(startTime, (ADD_RANGE_HOUR * -1));//真實班次早2小時
                    endTime = addHour(endTime, ADD_RANGE_HOUR);//真實班次多4小時(延長刷單子的時間)
                    //跨天
                    if((mesTime.compareTo(shiftDate) > 0) && (mesTime.compareTo(endTime) < 0)){//大於00:00~endTime(早上時間)表式跨天
                        return addDay(shiftDate, -1);//歸到前一天
                    }else{
                        return shiftDate;
                    }
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return null;
        }

        public Date[] adjustStartTime(Date otherShiftDate, Date mesStartTime, Date mesEndTime){
            Date[] startEndTime = new Date[2];
            try {
                String shiftDateStr = new SimpleDateFormat(DATE_FORMAT).format(otherShiftDate);//2016-10-10
                Date startTime = new SimpleDateFormat(TIME_FORMAT).parse(shiftDateStr + " " + this.shiftBegin + ":00");
                Date endTime = new SimpleDateFormat(TIME_FORMAT).parse(shiftDateStr + " " + this.shiftEnd + ":00");
                if(this.shiftBegin.compareTo(this.shiftEnd) > 0){//班次時間有跨天
                    endTime = addDay(endTime, 1);//+1天
                }
                //開始時間
                if(mesStartTime.compareTo(startTime) >= 0 && mesStartTime.compareTo(endTime) <= 0){//區間內
                    startEndTime[0] = mesStartTime;
                }else{
                    if(mesStartTime.compareTo(endTime) > 0){
                        startEndTime[0] = endTime;
                    }else{
                        startEndTime[0] = startTime;
                    }
                }
                //結束時間
                if(mesEndTime.compareTo(startTime) >= 0 && mesEndTime.compareTo(endTime) <= 0){//區間內
                    startEndTime[1] = mesEndTime;
                }else{
                    if(mesEndTime.compareTo(endTime) > 0){
                        startEndTime[1] = endTime;
                    }else{
                        startEndTime[1] = startTime;
                    }
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return startEndTime;
        }

        private Date addDay(Date date, int day){
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            cal.add(Calendar.DATE, day);
            return cal.getTime();
        }

        private Date addHour(Date date, int hour){
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            cal.add(Calendar.HOUR_OF_DAY, hour);
            return cal.getTime();
        }

        public String getYm() {
            return ym;
        }

        public String getEmpId() {
            return empId;
        }

        public String getEmpName() {
            return empName;
        }

        public String getShift() {
            return shift;
        }

        public String getShiftBegin() {
            return shiftBegin;
        }

        public String getShiftEnd() {
            return shiftEnd;
        }
    }
}
