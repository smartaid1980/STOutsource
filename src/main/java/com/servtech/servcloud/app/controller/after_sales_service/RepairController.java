package com.servtech.servcloud.app.controller.after_sales_service;

import com.servtech.servcloud.app.model.after_sales_service.Repair;
import com.servtech.servcloud.app.model.after_sales_service.view.RepairList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;


/**
 * Created by Raynard on 2016/5/26.
 */

@RestController
@RequestMapping("/aftersalesservice/repair")
public class RepairController {

        private final Logger logger = LoggerFactory.getLogger(RepairController.class);

        @Autowired
        private HttpServletRequest request;
        @Autowired
        private HttpServletResponse response;

    @RequestMapping(value = "/query", method = POST)
    public RequestResult<List<Map>> query(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                String machine = data.get("machine").toString();
                String repair = data.get("repair").toString();
                List<String> status = (List<String>)data.get("status");
                List<String> urgency = (List<String>) data.get("urgency");
                String customer = data.get("customer").toString();


                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_aftersalesservice_repair ");
                sb.append(" WHERE ");
                sb.append(getDateBetween(data.get("startDate").toString(), data.get("endDate").toString()));
                sb.append(getDBStringBySingle(customer, "cus_id"));
                sb.append(getDBStringBySingle(machine, "machine_id"));
                sb.append(getDBStringBySingle(repair, "repair_id"));
                sb.append(getDBStringByMany(urgency, "emergency"));
                sb.append(getDBStringByMany(status, "status_id"));
                return success(RepairList.findBySQL(sb.toString()).toMaps());
            }
        });
    }


    @RequestMapping(value = "/repairReportByDateRange", method = GET)
    public RequestResult<List<Map>> repairReportByDateRange(@RequestParam final String startDate, @RequestParam final String endDate) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                List<Map> result = new ArrayList<Map>();
                List<Date> dates = getDateList(startDate, endDate);
                Date preDate = null;
                for(Date date:dates){
                    Date currentDate = date;
                    if(preDate != null){
                        List<Map> allClearCount = Base.findAll(
                                "SELECT COUNT(*) AS all_repair_count FROM  a_aftersalesservice_repair" +
                                        " WHERE  create_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        //發生日期和排除日期要同一天才算有排除
                        List<Map> thatDateClearCount = Base.findAll(
                                "SELECT COUNT(*) AS that_date_close_count  FROM a_aftersalesservice_repair " +
                                        " WHERE status_id = '4' AND  create_time BETWEEN ? AND ?"
                                , preDate, currentDate);
                        int total = Integer.parseInt(allClearCount.get(0).get("all_repair_count").toString());
                        int clearCount = Integer.parseInt(thatDateClearCount.get(0).get("that_date_close_count").toString());
                        int noClearCount = total - clearCount;
                        //System.out.println("pre:" + format.format(preDate) + ", current:" + format.format(currentDate));
                        String dateStr = format.format(preDate);
                        Map ele = new HashMap();
                        ele.put("date", dateStr);
                        ele.put("total", total);
                        ele.put("close_count", clearCount);//排除個數
                        ele.put("no_close_count", noClearCount);//未排除個數
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
        SimpleDateFormat format = new SimpleDateFormat("yyyy/MM/dd");
        Date start, end;
        try {
            start = format.parse(startDate);
            end = format.parse(endDate);
            return getDateList(start, end);
        } catch (ParseException e) {
            logger.warn("date format error: {}, {}", startDate, endDate);
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

        @RequestMapping(value = "/create", method = POST)
        public RequestResult<String> create(@RequestBody final Map data) {
            try {
                return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                    @Override
                    public RequestResult<String> operate() {
                        data.put("status_id","0");
                        data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        data.put("create_time", new Timestamp(System.currentTimeMillis()));

                        Repair repair = new Repair();
                        repair.fromMap(data);
                        if (repair.insert()) {
                            return success(repair.getString("repair_id"));
                        } else {
                            return fail("新增失敗，原因待查...");
                        }
                    }
                });
            } catch (Exception e) {
                return fail(e.getMessage());
            }
        }


    @RequestMapping(value = "/update", method = POST)
    public RequestResult<String> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    Repair repair = new Repair();
                    repair.fromMap(data);
                    if (repair.saveIt()) {
                        return success(repair.getString("repair_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }



    @RequestMapping(value = "/close", method = POST)
    public RequestResult<String> close(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    java.sql.Timestamp dateTime = new Timestamp(System.currentTimeMillis());
                   data.put("close_time",dateTime);
                    data.put("modify_by",request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", dateTime);
                    Repair repair = new Repair();
                    repair.fromMap(data);
                    if (repair.saveIt()) {
                        return success(repair.getString("repair_id"));
                    } else {
                        return fail("結案失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    public String getDBStringByMany(List value,String column){
        String sqlString = "";
        if (value.size() > 1) {
            for (int i = 0; i < value.size(); i++) {
                if (i == 0) {
                    sqlString += " AND ("+ column+"='" + value.get(i).toString() + "' ";
                }else if(i==(value.size()-1)){
                    sqlString += " or  "+ column+ "='" + value.get(i).toString() + "' )";
                }
                else {
                    sqlString += " or  "+ column+ "='" + value.get(i).toString() + "' ";
                }
            }
        } else if(value.size()==1){
            sqlString += " AND "+ column+"='" + value.get(0).toString() + "' ";
        }
        return sqlString;
    }


    public String getDBStringBySingle(String value,String column){

        if (value == "" || value.equals("")) {
            return " ";
        } else {
            return " AND "+ column +"='" + value + "' ";
        }
    }

    public String getDateBetween(String startDate,String endDate){
        if((startDate.equals("")||startDate=="")||(endDate.equals("")||endDate=="")){
            return " create_time like '%'";
        }else{
            return " create_time BETWEEN '" +startDate + "  00:00:00'  AND ' " + endDate + "  23:59:59' ";
        }

    }
    }
