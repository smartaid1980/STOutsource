package com.servtech.servcloud.app.controller.after_sales_service;

import com.servtech.servcloud.app.model.after_sales_service.Repair;
import com.servtech.servcloud.app.model.after_sales_service.RepairMaterial;
import com.servtech.servcloud.app.model.after_sales_service.RepairRepay;
import com.servtech.servcloud.app.model.after_sales_service.view.AlarmStepLog;
import com.servtech.servcloud.app.model.after_sales_service.view.RepairMaterialLog;
import com.servtech.servcloud.app.model.after_sales_service.view.RepairList;
import com.servtech.servcloud.app.model.after_sales_service.view.RepairRepayLog;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2016/6/3.
 */

@RestController
@RequestMapping("/aftersalesservice/repairrepay")
public class RepairRepayController {

    private final Logger logger = LoggerFactory.getLogger(RepairRepayController.class);
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/query", method = POST)
    public RequestResult<List<Map>> query(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

//                String startDate = data.get("startDate").toString()+" 00:00:00";
//                String endDate = data.get("endDate").toString()+" 23:59:59";
                String machine = data.get("machine").toString();
                String repair = data.get("repair").toString();
                List<String> status = (List<String>)data.get("status");
                List<String> urgency = (List<String>) data.get("urgency");
                String customer = data.get("customer").toString();


                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_aftersalesservice_view_repair_repay ");
                sb.append(" WHERE ");
                sb.append(getDateBetween(data.get("startDate").toString(),data.get("endDate").toString()));
                sb.append(getDBStringBySingle(customer, "cus_id"));
                sb.append(getDBStringBySingle(machine, "machine_id"));
                sb.append(getDBStringBySingle(repair, "repair_id"));
                sb.append(getDBStringByMany(urgency, "emergency"));
                sb.append(getDBStringBySingle(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString(), "emp_id"));
                sb.append(getDBStringByMany(status, "status_id"));
                return success(RepairList.findBySQL(sb.toString()).toMaps());
            }
        });
    }

    @RequestMapping(value = "/creatematerial", method = POST)
    public  RequestResult<String> creatematerial(@RequestParam("repairid") final String repairid,@RequestBody final Map data) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    String totalPrice = data.get("total").toString();
                    data.remove("price");
                    data.remove("rm_id");
                    data.put("price",totalPrice);
                    data.put("repair_id", repairid);
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    RepairMaterial repairMaterial = new RepairMaterial();
                    repairMaterial.fromMap(data);
                    if (repairMaterial.insert()) {
                        return success(repairMaterial.getString("repair_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }


                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }


    @RequestMapping(value = "/readmaterial", method = GET)
    public RequestResult<List<Map>> readmaterial(@RequestParam("repairid") final String repairid) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT *");
                sb.append(" FROM ");
                sb.append(" a_aftersalesservice_view_repair_material ");
                sb.append(" WHERE ");
                sb.append(" repair_id = ");
                sb.append(repairid);
                RepairMaterialLog repairMaterialLog = new RepairMaterialLog();
                return success(repairMaterialLog.findBySQL(sb.toString()).toMaps());
            }
        });
    }

    @RequestMapping(value = "/updatematerial", method = PUT)
    public  RequestResult<String> updatematerial(@RequestParam("repairid") final String repairid,@RequestBody final Map data) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    String totalPrice = data.get("total").toString();
                    data.remove("price");
                    data.remove("create_time");
                    data.put("price",totalPrice);
                    data.put("repair_id", repairid);
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    RepairMaterial repairMaterial = new RepairMaterial();
                    repairMaterial.fromMap(data);
                    if (repairMaterial.saveIt()) {
                        return success(repairMaterial.getString("repair_id"));
                    } else {
                        return fail("更新失敗，原因待查...");
                    }


                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/deletematerial", method = DELETE)
    public  RequestResult<Void> deletematerial(@RequestBody final Object[] idList) {

            return ActiveJdbc.oper(new Operation<RequestResult<Void>>() {
                @Override
                public RequestResult<Void> operate() {
                    int deleteAmount = RepairMaterial.delete("rm_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                    return success();
                }

            });
    }



    @RequestMapping(value = "/readrepaylog", method = POST)
    public RequestResult<List<Map>> readrepaylog(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT *");
                sb.append(" FROM ");
                sb.append(" a_aftersalesservice_view_repair_log ");
                sb.append(" WHERE ");
                sb.append(" repair_id = ");
                sb.append(data.get("repair_id").toString());
                RepairRepayLog repairRepayLog = new RepairRepayLog();

                return success(repairRepayLog.findBySQL(sb.toString()).toMaps());
            }
        });
    }



    @RequestMapping(value = "/repay", method = POST)
    public RequestResult<String> repay(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                java.sql.Timestamp dateTime = new Timestamp(System.currentTimeMillis());
                Map repairUpdate = new HashMap();
                Map repairCreateReply = new HashMap();
                String result = data.get("result").toString();
                if(result=="0"||result.equals("0")) {
                    repairUpdate.put("status_id","2");
                }else if(result=="1"||result.equals("1")){
                    repairUpdate.put("status_id","3");
                }
                repairUpdate.put("repair_id", data.get("repair_id").toString());
                repairUpdate.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                repairUpdate.put("modify_time", dateTime);
                Repair repair = new Repair();
                repair.fromMap(repairUpdate);

                if(repair.saveIt()){
                    if(!(data.get("alarm_log_id").toString().equals("")||data.get("alarm_log_id").toString()=="")){
                        repairCreateReply.put("alarm_log_id",data.get("alarm_log_id").toString());
                    }
                    repairCreateReply.put("assign_id", data.get("assign_id").toString());
                    repairCreateReply.put("maintain_time",data.get("maintain_time").toString());
                    repairCreateReply.put("repay_note",data.get("repay_note").toString());
                    repairCreateReply.put("result",data.get("result").toString());
                    repairCreateReply.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    repairCreateReply.put("create_time",dateTime);
                    RepairRepay repairRepay = new RepairRepay();
                    repairRepay.fromMap(repairCreateReply);
                    if(repairRepay.insert()){
                        return  success();
                    }else{
                        return fail("Insert a_aftersalesservice_repair_repay is fail ");
                    }
                }else{
                    return  fail("Update a_aftersalesservice_repair is fail");
                }
            }
        });


    }

    @RequestMapping(value = "/alarmclear", method = POST)
    public RequestResult<List<Map>> alarmclear(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT *");
                sb.append(" FROM ");
                sb.append(" a_aftersalesservice_view_alarm_log ");
                sb.append(" WHERE ");
                sb.append("  alarm_log_id= ");
                sb.append(data.get("log_id").toString());
                sb.append(" AND ");
                sb.append(" alarm_id= ");
                sb.append(data.get("alarm_id").toString());
                AlarmStepLog alarmStepLog = new AlarmStepLog();

                return success(alarmStepLog.findBySQL(sb.toString()).toMaps());
            }
        });
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
