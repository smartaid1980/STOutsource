package com.servtech.servcloud.app.controller.aerowin;

import com.google.common.collect.ComparisonChain;
import com.servtech.common.file.Files;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
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
import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2016/10/7.
 */

@RestController
@RequestMapping("/aerowin/dailyreport")
public class DailyReportController {
    private final Logger log = LoggerFactory.getLogger(DailyReportController.class);

    private final String DATE_FORMAT = "yyyy-MM-dd";
    private final String TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private final String YM_FORMAT = "yyyyMM";

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/dailyreportByDepartRange", method = GET)
    public RequestResult<List<Map>> dailyreportByDepartRange(
            @RequestParam("departId") final String departId,
            @RequestParam("startDate") final Date startDate,
            @RequestParam("endDate") final Date endDate
    ){
        return ActiveJdbc.operTx(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                //依班次日期、工作部門、報工人員(人員名稱)、機台、工單、工序排序
                List<Map> resultMaps = Base.findAll("SELECT aadr.*, aaaw.product_name  FROM a_aerowin_daily_report aadr LEFT JOIN a_aerowin_awmeswo aaaw ON aadr.work_id = aaaw.work_id AND aadr.op = aaaw.op " +
                        " WHERE aadr.depart_id = ? AND aadr.shift_date BETWEEN ? AND ?" +
                        " ORDER BY aadr.shift_date, aadr.depart_id, aadr.emp_id, aadr.machine_id, aadr.work_id, aadr.op", departId, startDate, endDate);
                for (Map resultMap : resultMaps) {//日期轉字串，因為不轉格式裡面會有中文
                    resultMap.put("shift_date", AerowinUtil.date2str((Date) resultMap.get("shift_date"), DATE_FORMAT));
                }
                return success(resultMaps);
            }
        });
    }

    @RequestMapping(value = "/calcDailyReport", method = GET)
    public RequestResult<String> calcDailyReport() {
        String dateStr = AerowinUtil.date2str(new Date(), DATE_FORMAT);
        Date endDate = AerowinUtil.str2date(dateStr, DATE_FORMAT);//當天
        Date startDate = AerowinUtil.addDay(endDate, -1);//前一天
        return calcDailyReport(startDate, endDate);
    }

    @RequestMapping(value = "/calcDailyReportByRange", method = GET)
    public RequestResult<String> calcDailyReportByRange(
            @RequestParam("startDate") final Date startDate,
            @RequestParam("endDate") final Date endDate
    ) {
        return calcDailyReport(startDate, endDate);
    }

    private RequestResult<String> calcDailyReport(final Date startDate, final Date endDate){
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            final Map<String, AerowinUtil.Employee> employeeMap = AerowinUtil.initEmployeeMap();

            @Override
            public RequestResult<String> operate() {
                //初始化Employee，之後用來歸日期和區間用
                //Map<ym@empId, Employee>
                List<Date> range = AerowinUtil.getDateList(startDate, endDate);
                RestTime restTime = new RestTime(range);//初始化休息時間
                for (Date currentDate : range) {
                    String dateStr = AerowinUtil.date2str(currentDate, DATE_FORMAT);
                    Date date = AerowinUtil.str2date(dateStr, DATE_FORMAT);
                    //Date startTime = addDay(date, -1);//一次算三天的範圍
                    //Date endTime = addDay(date, 1);
                    if (!calcDailyReportByRange(date, employeeMap, restTime)) {
                        return fail("calcDailyReport calc fail, shiftDate: " + AerowinUtil.date2str(date, DATE_FORMAT));
                    }
                }
                return success();
            }
        });
    }

    private boolean calcDailyReportByRange(Date date, Map<String, AerowinUtil.Employee> employeeMap, RestTime restTime) {
        String createBy = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        Timestamp createTime = new Timestamp(System.currentTimeMillis());
        //取得範圍內的全部工單ID(唯一)
        List<Map> atRangeWorkIdAndOpMaps = Base.findAll(
                "SELECT DISTINCT aaa.work_id, aaa.op FROM a_aerowin_awmes aaa" +
                " WHERE aaa.shift_date = ?", date);
        //log.info("IN: {}", new Gson().toJson(buildMultiInParam(atRangeWorkIdAndOpMaps)));
        if(atRangeWorkIdAndOpMaps.size() > 0){
            //用工單ID(唯一)找出全部的工單(有用到此工單ID的工單)
            List<Map> awmesMaps = Base.findAll("SELECT aaa.shift_date, aaa.emp_id, aaa.machine_id, aaa.machine_name, aaa.depart_id, aaa.work_id, aaa.op, aaa.product_id, aaa.quantity_esp," +
                    //" aaa.go_no, aaa.ng_no, aaa.cus_pro, aaa.mes_time FROM a_aerowin_awmes aaa" +
                    " aaa.go_no, aaa.ng_no, aaa.cus_pro, aaa.mes_time, aaaw.product_name FROM a_aerowin_awmes aaa LEFT JOIN a_aerowin_awmeswo aaaw ON aaa.work_id = aaaw.work_id AND aaa.op = aaaw.op" +
                    " WHERE (aaa.work_id, aaa.op) IN (" + buildMultiInStr(atRangeWorkIdAndOpMaps.size()) + ")", buildMultiInParam(atRangeWorkIdAndOpMaps));

            log.info("awmesMaps size: {}", awmesMaps.size());
            CalcDailyReport calcDailyReport = new CalcDailyReport(awmesMaps, employeeMap, restTime);
            List<DailyReport> dailyReports = calcDailyReport.calc();

            for(DailyReport dailyReport:dailyReports) {
                if (dailyReport.getQuantityIn() < 0) {
                    log.warn("*** quantity_in value < 0, work_id: {}", dailyReport.getWorkId());
                    dailyReport.setQuantityIn(0);//設為0不然無法進db....
                }
                Base.exec("INSERT INTO a_aerowin_daily_report (shift_date, shift, emp_id, emp_name, machine_id, machine_name, depart_id, work_id, op," +
                                " product_id, quantity_esp, quantity_in, go_no, ng_no, quantity_res, labor_hour, labor_hour_real, cus_pro," +
                                " complete_pct, time_begin, time_begin_m, time_end, time_end_m, create_by, create_time) " +
                                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" +
                                " ON DUPLICATE KEY UPDATE quantity_esp = ?, quantity_in = ?," +
                                "     go_no = ?, ng_no = ?, quantity_res = ?, labor_hour = ?, labor_hour_real = ?, cus_pro = ?," +
                                "     complete_pct = ?, time_begin = ?, time_begin_m = ?, time_end = ?, time_end_m = ?, modify_by = ?, modify_time = ?",
                        dailyReport.getShiftDate(), dailyReport.getShift(), dailyReport.getEmpId(), dailyReport.getEmpName(), dailyReport.getMachineId(), dailyReport.getMachineName(),
                        dailyReport.getDepartId(), dailyReport.getWorkId(), dailyReport.getOp(), dailyReport.getProductId(),
                        dailyReport.getQuantityEsp(), dailyReport.getQuantityIn(), dailyReport.getGoNo(), dailyReport.getNgNo(),
                        dailyReport.getQuantityRes(), dailyReport.getLaborHour(), dailyReport.getLaborHourReal(), dailyReport.getCusPro(),
                        dailyReport.getCompletePct(), dailyReport.getTimeBegin(), dailyReport.getTimeBeginM(), dailyReport.getTimeEnd(), dailyReport.getTimeEndM(),
                        createBy, createTime,
                        dailyReport.getQuantityEsp(), dailyReport.getQuantityIn(), dailyReport.getGoNo(), dailyReport.getNgNo(),
                        dailyReport.getQuantityRes(), dailyReport.getLaborHour(), dailyReport.getLaborHourReal(), dailyReport.getCusPro(),
                        dailyReport.getCompletePct(), dailyReport.getTimeBegin(), dailyReport.getTimeBeginM(), dailyReport.getTimeEnd(), dailyReport.getTimeEndM(),
                        createBy, createTime);
            }
        }
        return true;
    }

    private Object[] buildMultiInParam(List<Map> workIdAndOpMaps){
        List<Object> params = new ArrayList<Object>();
        for(Map workIdAndOpMap:workIdAndOpMaps){
            String workId = workIdAndOpMap.get("work_id").toString();
            Integer op = ((BigInteger) workIdAndOpMap.get("op")).intValue();
            params.add(workId);
            params.add(op);
        }
        return params.toArray();
    }

    private String buildMultiInStr(int size){// (?, ?), (?, ?) ...
        StringBuilder sb = new StringBuilder();
        for(int count=0; count<size; count++){
            if(count > 0){
                sb.append(", ");
            }
            sb.append("(?, ?)");
        }
        return sb.toString();
    }

    private class CalcDailyReport{
        private Map<String, AerowinUtil.Employee> employeeMap;//ym@empId
        private RestTime restTime;//休息時間
        private List<DailyReport> dailyReports;
        private Map<String, DailyReport> dispatchDailyReportMap;
        private List<DailyReport> dailyReportResults;

        public CalcDailyReport(List<Map> awmesMaps, Map<String, AerowinUtil.Employee> employeeMap, RestTime restTime){
            this.employeeMap = employeeMap;
            this.restTime = restTime;
            this.dispatchDailyReportMap = new HashMap<String, DailyReport>();
            this.dailyReportResults = new ArrayList<DailyReport>();
            initDailyReports(awmesMaps);
        }

        private void initDailyReports(List<Map> awmesMaps){
            this.dailyReports = new ArrayList<DailyReport>();
            for(Map awmesMap:awmesMaps){
                Date shiftDate = (Date) awmesMap.get("shift_date");
                String empId = awmesMap.get("emp_id").toString();
                String machineId = awmesMap.get("machine_id").toString();
                String departId = awmesMap.get("depart_id").toString();
                String workId = awmesMap.get("work_id").toString();
                Integer op = ((BigInteger) awmesMap.get("op")).intValue();
                String productId = awmesMap.get("product_id").toString();
                Integer quantityEsp = ((BigInteger) awmesMap.get("quantity_esp")).intValue();
                Integer goNo = ((BigInteger) awmesMap.get("go_no")).intValue();
                Integer ngNo = ((BigInteger) awmesMap.get("ng_no")).intValue();
                String cusPro = awmesMap.get("cus_pro").toString();
                Date mesTime = (Date) awmesMap.get("mes_time");

                String productName = null;
                if(awmesMap.containsKey("product_name") && awmesMap.get("product_name") != null){
                    productName = awmesMap.get("product_name").toString();
                }

                String machineName = awmesMap.get("machine_name").toString();

                dailyReports.add(new DailyReport(shiftDate, empId, machineId, departId, workId, op, productId, quantityEsp, goNo, ngNo, cusPro, mesTime, productName, machineName));
            }
        }

        public List<DailyReport> calc(){
            dispatch();
            sort();
            calcQuantityAndLaborHour();
            //saveFile();
            return this.dailyReportResults;
        }

        private void dispatch(){
            //分類並計算開始到結束時間、累計
            for(DailyReport dailyReportTemp:dailyReports){
                DailyReport dailyReport = dailyReportTemp.cloneObj();
                Date mesTime = dailyReport.getMesTime();
                String ym = AerowinUtil.date2str(mesTime, YM_FORMAT);//yyyyMM
                //由mesTime找出歸哪一日
                String employeeKey = ym + "@" + dailyReport.getEmpId();
                AerowinUtil.Employee employee;
                if(this.employeeMap.containsKey(employeeKey)){//使用真的
                    employee = this.employeeMap.get(employeeKey);
                }else{
                    log.warn("*** not find ym: {}, empId: {}", ym, dailyReport.getEmpId());
                    //*** 假的，因為上傳的excel裡面沒有此emp
                    employee = AerowinUtil.defaultEmployee(mesTime, dailyReport.getEmpId());
                }
                //dailyReport.setShiftDate(employee.findShiftDate(mesTime));
                dailyReport.setShift(employee.getShift());
                dailyReport.setEmpName(employee.getEmpName());
                //相同班次日期、工作部門、工單、工序、機台、人員為一筆
                String key = dailyReport.getShiftDate() + "@" + dailyReport.getDepartId() + "@" +
                        dailyReport.getWorkId() + "@" + dailyReport.getOp() + "@" +
                        dailyReport.getMachineId() + "@" + dailyReport.getEmpId();
                if(!this.dispatchDailyReportMap.containsKey(key)){//第一次出現，要放入MAP
                    this.dispatchDailyReportMap.put(key, dailyReport);
                }else{
                    this.dispatchDailyReportMap.get(key).updateGoNoAndNgNo(dailyReport);//累加個數
                }
                this.dispatchDailyReportMap.get(key).updateMinTimeBeginAndMaxTimeEnd(dailyReport);
            }
            //歸類區間(就是計算time_begin_m和time_end_m)
            for(Map.Entry<String, DailyReport> dailyReportEntry:this.dispatchDailyReportMap.entrySet()){
                DailyReport dailyReport = dailyReportEntry.getValue();
                String ym = AerowinUtil.date2str(dailyReport.getShiftDate(), YM_FORMAT);//yyyyMM
                //由mesTime找出歸哪一個區間
                String employeeKey = ym + "@" + dailyReport.getEmpId();
                if(this.employeeMap.containsKey(employeeKey)){
                    AerowinUtil.Employee employee = this.employeeMap.get(employeeKey);
                    Date[] startEndTime = employee.adjustStartTime(dailyReport.getShiftDate(), dailyReport.getTimeBegin(), dailyReport.getTimeEnd());
                    dailyReport.setTimeBeginM(startEndTime[0]);
                    dailyReport.setTimeEndM(startEndTime[1]);
                    //dailyReport.setTimeBeginM(new Date(employee.adjustStartTime(dailyReport.getShiftDate(), dailyReport.getTimeBegin(), dailyReport.getTimeEnd()).getTime()));
                }else{//假的班次去做....
                    AerowinUtil.Employee employee = AerowinUtil.defaultEmployee(dailyReport.getShiftDate(), dailyReport.getEmpId());
                    Date[] startEndTime = employee.adjustStartTime(dailyReport.getShiftDate(), dailyReport.getTimeBegin(), dailyReport.getTimeEnd());
                    dailyReport.setTimeBeginM(startEndTime[0]);
                    dailyReport.setTimeEndM(startEndTime[1]);
                }
                this.dailyReportResults.add(dailyReport);
            }
        }

        private void sort(){
            Collections.sort(this.dailyReportResults, new Comparator<DailyReport>() {
                @Override
                public int compare(DailyReport o1, DailyReport o2) {
                    return ComparisonChain.start()
                            .compare(o1.getWorkId(), o2.getWorkId())
                            .compare(o1.getOp(), o2.getOp())
                            //.compare(o1.getMachineId(), o2.getMachineId())
                            .compare(o1.getTimeBegin(), o2.getTimeBegin())
                            .compare(o1.getTimeEnd(), o2.getTimeEnd())
                            .result();
                }
            });
        }

        private void calcQuantityAndLaborHour(){
            String preWorkId = null;
            Integer preOp = null;
            //String preMachineId = null;
            Integer preGoNoAndNgNoCount = 0;//上一筆同工單、工序、機台的良品數和不良品數累計
            for(DailyReport dailyReport:this.dailyReportResults){
                if(preWorkId == null && preOp == null ){//第一次
                    preGoNoAndNgNoCount = dailyReport.getGoNo() + dailyReport.getNgNo();
                    //接班剩餘數量 (同工單、工序的前一班的本班未完成數量；若無或為0，值為本筆的工單預計數量)
                    dailyReport.setQuantityIn(0);
                    //本班未完成數量 (工單預計數量-良品-不良品)
                    dailyReport.setQuantityRes(dailyReport.getQuantityEsp() - dailyReport.getGoNo() - dailyReport.getNgNo());
                    dailyReport.setCompletePct((float) preGoNoAndNgNoCount / (float) dailyReport.getQuantityEsp());
                }else{
                    String preKey = preWorkId + "@" + preOp;// + "@" + preMachineId;
                    String currentKey = dailyReport.getWorkId() + "@" + dailyReport.getOp();// + "@" + dailyReport.getMachineId();
                    if(!preKey.equals(currentKey)){//上一張跟目前這一張不一樣
                        preGoNoAndNgNoCount = dailyReport.getGoNo() + dailyReport.getNgNo();
                        //接班剩餘數量 (同工單、工序的前一班的本班未完成數量；若無或為0，值為本筆的工單預計數量)
                        dailyReport.setQuantityIn(0);
                        //本班未完成數量 (工單預計數量-良品-不良品)
                        dailyReport.setQuantityRes(dailyReport.getQuantityEsp() - dailyReport.getGoNo() - dailyReport.getNgNo());
                        dailyReport.setCompletePct((float) preGoNoAndNgNoCount / (float) dailyReport.getQuantityEsp());
                    }else{//與上一筆工單同工單、工序
                        int quantityIn = dailyReport.getQuantityEsp() - preGoNoAndNgNoCount;//預計減累計等於上次剩餘
                        //接班剩餘數量 (同工單、工序的前一班的本班未完成數量；若無或為0，值為本筆的工單預計數量)
                        dailyReport.setQuantityIn(quantityIn);
                        //*** 更新累計數量
                        preGoNoAndNgNoCount = preGoNoAndNgNoCount + dailyReport.getGoNo() + dailyReport.getNgNo();
                        //本班未完成數量 (工單預計數量-良品-不良品)
                        dailyReport.setQuantityRes(dailyReport.getQuantityEsp() - dailyReport.getGoNo() - dailyReport.getNgNo());
                        dailyReport.setCompletePct((float) preGoNoAndNgNoCount / (float) dailyReport.getQuantityEsp());
                    }
                }
                long restDurationSec = this.restTime.getRestDurationSec(dailyReport.getTimeBegin(), dailyReport.getTimeEnd());
                //完整工時 (最早/最晚的最後修改時間互減)
                long laborSec = (dailyReport.getTimeEnd().getTime() - dailyReport.getTimeBegin().getTime()) / 1000;
                //實際工時 (完整工時-完整休息時間)
                long laborSecReal = laborSec - restDurationSec;
                dailyReport.setLaborHour(laborSec / 3600f);//完整工時 (最早/最晚的最後修改時間互減)
                dailyReport.setLaborHourReal(laborSecReal / 3600f);//實際工時 (完整工時-完整休息時間)

                if(dailyReport.getQuantityRes() < 0){//負數... 先設為0
                    dailyReport.setQuantityRes(0);
                }

                preWorkId = dailyReport.getWorkId();
                preOp = dailyReport.getOp();
                //preMachineId = dailyReport.getMachineId();
            }
        }

        private void saveFile(){
            StringBuilder sb = new StringBuilder();
            for(DailyReport dailyReport:this.dailyReportResults){
                sb.append(dailyReport.toCsv()).append("\r\n");
            }
            try {
                Files.writeStringToFile(sb.toString(), new File("D:/KEVIN_TEST/dailyReport.csv"));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private class DailyReport{
        //awmes
        private String empId;//報工人員編號
        private String machineId;//機台編號
        private String departId;//工作部門
        private String workId;//工單編號
        private Integer op;//工序
        private String productId;//產品代碼
        private Integer quantityEsp;//工單預計數量
        private Integer goNo;//良品數
        private Integer ngNo;//不良品數
        private String cusPro;//客戶件號
        private Date mesTime;//MES最後修改時間
        //FK
        private Date shiftDate;//班次日期 (依據報工人員班次推算班次日期)
        private String shift;//班次 (依人員排班表歸班次)
        private String empName;//報工人員名稱
        private String machineName;//機台名稱　
        private String productName;//產品名稱
        //daily report
        private Integer quantityIn;//接班剩餘數量 (同工單、工序、機台的前一班的本班未完成數量；若無或為0，值為本筆的工單預計數量)
        private Integer quantityRes;//本班未完成數量 (工單預計數量-良品-不良品)
        private Float laborHour;//完整工時 (最早/最晚的最後修改時間互減)
        private Float laborHourReal;//實際工時 (完整工時-完整休息時間)
        private Float completePct;//工單進度 (良品數+不良品數/工單計畫數量)
        private Date timeBegin;//起始時間 (最早的最後修改時間)
        private Date timeBeginM;//調整後起始時間 (最早的最後修改時間，依據該人員班次時間調整)
        private Date timeEnd;//結束時間 (最晚的最後修改時間)
        private Date timeEndM;//調整後結束時間 (最晚的最後修改時間，依據該人員班次時間調整)

        public DailyReport(Date shiftDate, String empId, String machineId, String departId, String workId, Integer op, String productId,
                           Integer quantityEsp, Integer goNo, Integer ngNo, String cusPro, Date mesTime, String productName, String machineName) {
            this.shiftDate = shiftDate;
            this.empId = empId;
            this.machineId = machineId;
            this.departId = departId;
            this.workId = workId;
            this.op = op;
            this.productId = productId;
            this.quantityEsp = quantityEsp;
            this.goNo = goNo;
            this.ngNo = ngNo;
            this.cusPro = cusPro;
            this.mesTime = mesTime;

            //預設為mesTime當做基準點
            this.timeBegin = mesTime;
            this.timeEnd = mesTime;

            this.productName = productName;
            this.machineName = machineName;
        }

        public void updateMinTimeBeginAndMaxTimeEnd(DailyReport otherDailyReport){
            if(this.timeBegin.compareTo(otherDailyReport.getMesTime()) > 0){//最小時間當startTime
                this.timeBegin = otherDailyReport.getMesTime();
            }

            if(this.timeEnd.compareTo(otherDailyReport.getMesTime()) < 0){//最大時間當endTime
                this.timeEnd = otherDailyReport.getMesTime();
            }
        }

        public void updateGoNoAndNgNo(DailyReport otherDailyReport){
            this.goNo += otherDailyReport.getGoNo();
            this.ngNo += otherDailyReport.getNgNo();
        }

        public String toCsv(){
            StringBuilder sb = new StringBuilder();
            sb.append(empId);//報工人員編號
            sb.append("|");
            sb.append(machineId);//機台編號
            sb.append("|");
            sb.append(departId);//工作部門
            sb.append("|");
            sb.append(workId);//工單編號
            sb.append("|");
            sb.append(op);//工序
            sb.append("|");
            sb.append(productId);//產品代碼
            sb.append("|");
            sb.append(quantityEsp);//工單預計數量
            sb.append("|");
            sb.append(goNo);//良品數
            sb.append("|");
            sb.append(ngNo);//不良品數
            sb.append("|");
            sb.append(cusPro);//客戶件號
            sb.append("|");
            sb.append(mesTime);//MES最後修改時間
            sb.append("|");
            //FK
            sb.append(AerowinUtil.date2str(shiftDate, DATE_FORMAT));//班次日期 (依據報工人員班次推算班次日期)
            sb.append("|");
            sb.append(shift);//班次 (依人員排班表歸班次)
            sb.append("|");
            sb.append(empName);//報工人員名稱
            sb.append("|");
            sb.append(machineName);//機台名稱　
            sb.append("|");
            sb.append(productName);//產品名稱
            sb.append("|");
            //daily report
            sb.append(quantityIn);//接班剩餘數量 (同工單、工序、機台的前一班的本班未完成數量；若無或為0，值為本筆的工單預計數量)
            sb.append("|");
            sb.append(quantityRes);//本班未完成數量 (工單預計數量-良品-不良品)
            sb.append("|");
            sb.append(laborHour);//完整工時 (最早/最晚的最後修改時間互減)
            sb.append("|");
            sb.append(laborHourReal);//實際工時 (完整工時-完整休息時間)
            sb.append("|");
            sb.append(completePct);//工單進度 (良品數+不良品數/工單計畫數量)
            sb.append("|");
            sb.append(AerowinUtil.date2str(timeBegin, TIME_FORMAT));//起始時間 (最早的最後修改時間)
            sb.append("|");
            sb.append(AerowinUtil.date2str(timeBeginM, TIME_FORMAT));//調整後起始時間 (最早的最後修改時間，依據該人員班次時間調整)
            sb.append("|");
            sb.append(AerowinUtil.date2str(timeEnd, TIME_FORMAT));//結束時間 (最晚的最後修改時間)
            sb.append("|");
            sb.append(AerowinUtil.date2str(timeEndM, TIME_FORMAT));//調整後結束時間 (最晚的最後修改時間，依據該人員班次時間調整)
            return sb.toString();
        }

        public DailyReport cloneObj(){
            return new DailyReport(this.shiftDate, this.empId, this.machineId, this.departId, this.workId, this.op, this.productId,
                    this.quantityEsp, this.goNo, this.ngNo, this.cusPro, this.mesTime, this.productName, this.machineName);
        }

//        public void setShiftDate(Date shiftDate) {
//            this.shiftDate = shiftDate;
//        }

        public void setShift(String shift) {
            this.shift = shift;
        }

        public void setEmpName(String empName) {
            this.empName = empName;
        }

        public void setMachineName(String machineName) {
            this.machineName = machineName;
        }

//        public void setProductName(String productName) {
//            this.productName = productName;
//        }

        public void setQuantityIn(Integer quantityIn) {
            this.quantityIn = quantityIn;
        }

        public void setQuantityRes(Integer quantityRes) {
            this.quantityRes = quantityRes;
        }

        public void setLaborHour(Float laborHour) {
            this.laborHour = laborHour;
        }

        public void setLaborHourReal(Float laborHourReal) {
            this.laborHourReal = laborHourReal;
        }

        public void setCompletePct(Float completePct) {
            this.completePct = completePct;
        }

        public void setTimeBegin(Date timeBegin) {
            this.timeBegin = timeBegin;
        }

        public void setTimeBeginM(Date timeBeginM) {
            this.timeBeginM = timeBeginM;
        }

        public void setTimeEnd(Date timeEnd) {
            this.timeEnd = timeEnd;
        }

        public void setTimeEndM(Date timeEndM) {
            this.timeEndM = timeEndM;
        }

        public String getEmpId() {
            return empId;
        }

        public String getMachineId() {
            return machineId;
        }

        public String getDepartId() {
            return departId;
        }

        public String getWorkId() {
            return workId;
        }

        public Integer getOp() {
            return op;
        }

        public String getProductId() {
            return productId;
        }

        public Integer getQuantityEsp() {
            return quantityEsp;
        }

        public Integer getGoNo() {
            return goNo;
        }

        public Integer getNgNo() {
            return ngNo;
        }

        public String getCusPro() {
            return cusPro;
        }

        public Date getMesTime() {
            return mesTime;
        }

        public Date getShiftDate() {
            return shiftDate;
        }

        public String getShift() {
            return shift;
        }

        public String getEmpName() {
            return empName;
        }

        public String getMachineName() {
            return machineName;
        }

        public String getProductName() {
            return productName;
        }

        public Integer getQuantityIn() {
            return quantityIn;
        }

        public Integer getQuantityRes() {
            return quantityRes;
        }

        public Float getLaborHour() {
            return laborHour;
        }

        public Float getLaborHourReal() {
            return laborHourReal;
        }

        public Float getCompletePct() {
            return completePct;
        }

        public Date getTimeBegin() {
            return timeBegin;
        }

        public Date getTimeBeginM() {
            return timeBeginM;
        }

        public Date getTimeEnd() {
            return timeEnd;
        }

        public Date getTimeEndM() {
            return timeEndM;
        }
    }

    private class RestTime{
        private List<String> datesStrs;
        private List<TimeRange> restTimes;

        public RestTime(List<Date> dates){
            this.datesStrs = new ArrayList<String>();
            for(Date date:dates){
                this.datesStrs.add(AerowinUtil.date2str(date, DATE_FORMAT));
            }
            this.restTimes = new ArrayList<TimeRange>();
            initRestTime();
        }

        public long getRestDurationSec(Date startTime, Date endTime){
            long totalRestTime = 0;
            for(TimeRange timeRange:this.restTimes){
                if(timeRange.hasIntersection(startTime, endTime)){//在區間內，加總休息時間
                    totalRestTime += timeRange.getDuration();
                }
            }
            return totalRestTime;//
        }

        private void initRestTime(){
            for(String date:this.datesStrs){
                this.restTimes.add(new TimeRange(date, "10:00", "10:15"));
                this.restTimes.add(new TimeRange(date, "12:00", "13:00"));
                this.restTimes.add(new TimeRange(date, "15:00", "15:15"));
                this.restTimes.add(new TimeRange(date, "17:30", "18:00"));
                this.restTimes.add(new TimeRange(date, "22:00", "22:15"));
                this.restTimes.add(new TimeRange(date, "00:00", "00:30"));
                this.restTimes.add(new TimeRange(date, "03:00", "03:15"));
            }
        }
    }

    private class TimeRange{
        private static final String START_SEC = "00";
        private static final String END_SEC = "59";
        private Date startTime;
        private Date endTime;
        private Long duration;

        public TimeRange(String date, String startTimeStr, String endTimeStr) {
            try {
                String startTime = date + " " + startTimeStr + ":" + START_SEC;
                String endTime = date + " " + endTimeStr + ":" + END_SEC;
                this.startTime = new SimpleDateFormat(TIME_FORMAT).parse(startTime);
                this.endTime = new SimpleDateFormat(TIME_FORMAT).parse(endTime);
                this.duration = (this.endTime.getTime() - this.startTime.getTime()) / 1000;
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }

        //判斷是否有交集
        public boolean hasIntersection(Date bigStartTime, Date bigEndTime){
            //OS < LS && OE < LS
            boolean isSmaller = (this.startTime.compareTo(bigStartTime) < 0) &&
                    (this.endTime.compareTo(bigStartTime) < 0);
            //OS > LE && OE > LE
            boolean isBigger = (this.startTime.compareTo(bigEndTime) > 0) &&
                    (this.endTime.compareTo(bigEndTime) > 0);
            //!(OS < LS && OE < LS || OS > LE && OE > LE)
            if(!(isSmaller || isBigger)){//有交集
                return true;
            }else{
                return false;
            }
        }

        public Date getStartTime() {
            return startTime;
        }

        public Date getEndTime() {
            return endTime;
        }

        public Long getDuration() {
            return duration;
        }
    }
}
