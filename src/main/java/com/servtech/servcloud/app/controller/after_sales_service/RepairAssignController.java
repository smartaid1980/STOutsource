package com.servtech.servcloud.app.controller.after_sales_service;


import com.servtech.servcloud.app.model.after_sales_service.Repair;
import com.servtech.servcloud.app.model.after_sales_service.RepairAssign;
import com.servtech.servcloud.app.model.after_sales_service.RepairAssignEmp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.SysUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.*;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2016/5/17.
 */

@RestController
@RequestMapping("/aftersalesservice/repairassign")
public class RepairAssignController {

    private final Logger logger = LoggerFactory.getLogger(RepairAssignController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;



    @RequestMapping(value = "/query", method = POST)
    public RequestResult<List<Map>> query(@RequestBody final RepairQueryParam repairQueryParam) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String machine = repairQueryParam.getMachine();
                String repair = repairQueryParam.getRepair();
                String status = repairQueryParam.getStatus();
                String urgency = repairQueryParam.getUrgency();
                String customer = repairQueryParam.getCustomer();

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_aftersalesservice_repair ");
                sb.append(" WHERE ");
                sb.append(repairQueryParam.getDateBetween(repairQueryParam.getStartDate(),repairQueryParam.getEndDate()));
                sb.append(customer);
                sb.append(machine);
                sb.append(repair);
                sb.append(status);
                sb.append(urgency);
                return success(Repair.findBySQL(sb.toString()).toMaps());

            }
        });
    }

    @RequestMapping(value = "/getrepairdata", method = POST)
    public RequestResult<List<Map>> getrepairdata(@RequestBody final String repairid) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT repair.*,sysuser.user_name from a_aftersalesservice_repair repair ");
                sb.append(" left join ");
                sb.append(" m_sys_user sysuser ");
                sb.append("on repair.create_by = sysuser.user_id ");
                sb.append(" WHERE ");
                sb.append(" repair_id = " + repairid + "");
                return success(Repair.findBySQL(sb.toString()).toMaps());

            }
        });
    }


    @RequestMapping(value = "/getusergroup", method = POST)
    public RequestResult<List<Map>> getusergroup(@RequestBody final String entityid) {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT  sysuser.user_id,sysuser.user_name ");
                sb.append("from (select breakdown_id,entity_id from a_aftersalesservice_entity_breakdown ");
                sb.append(" WHERE entity_id=");
                sb.append(entityid);
                sb.append(") as entitybreakdown ");
                sb.append(" inner join ");
                sb.append(" (select entity_id,user_id from a_aftersalesservice_entity_emp) as entityemp ");
                sb.append(" on entitybreakdown.entity_id=entityemp.entity_id ");
                sb.append(" left join ");
                sb.append("(select * from m_sys_user) as sysuser ");
                sb.append(" on sysuser.user_id = entityemp.user_id ");

                return success(SysUser.findBySQL(sb.toString()).toMaps());

            }
        });
    }

    @RequestMapping(value = "/assingrepaircreate", method = POST)
    public RequestResult<String> assingrepaircreate(@RequestBody final Map data) {

        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                boolean dBstatus = false;
                java.sql.Timestamp dateTime = new Timestamp(System.currentTimeMillis());
                String repair_id = data.get("repairId").toString();
                String order_date = data.get("orderDate").toString();
                String recommend = data.get("recommend").toString();
                data.put("create_time", dateTime);
                data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                Map repairUpdateMap = new HashMap();
                repairUpdateMap.put("repair_id", repair_id);
                repairUpdateMap.put("assign_time", dateTime);
                repairUpdateMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                repairUpdateMap.put("modify_time", dateTime);
                repairUpdateMap.put("status_id", 1);
                Repair repair = new Repair();
                repair.fromMap(repairUpdateMap);
                if (repair.saveIt()) {
                    Map repairassignMap = new HashMap();
                    repairassignMap.put("repair_id", repair_id);
                    repairassignMap.put("order_date", order_date);
                    repairassignMap.put("recommend", recommend);
                    repairassignMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    repairassignMap.put("create_time", dateTime);
                    RepairAssign repairAssign = new RepairAssign();
                    repairAssign.fromMap(repairassignMap);
                    if (repairAssign.insert()) {
                        repairAssign = new RepairAssign();
                        List<RepairAssign> repairAssignMap = repairAssign.find("repair_id = ?", repair_id);
                        String assign_id = repairAssignMap.get(0).getString("assign_id");
                        Map repairEmpMap = new HashMap();
                        repairEmpMap.put("assign_id", assign_id);
                        RepairAssignEmp repairAssignEmp = new RepairAssignEmp();
                        repairAssignEmp.delete("assign_id=" + assign_id);
                        for (String user : (List<String>) data.get("users")) {
                            repairEmpMap.put("emp_id", user);
                            repairAssignEmp.fromMap(repairEmpMap);

                            if (repairAssignEmp.insert()) {
                                dBstatus = true;
                            } else {
                                dBstatus = false;

                            }
                        }
                    } else {
                        repairassignMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        repairassignMap.put("modify_time", dateTime);
                        repairassignMap.remove("create_by");
                        repairassignMap.remove("create_time");
                        repairAssign.fromMap(repairassignMap);
                        if (repairAssign.saveIt()) {
                            repairAssign = new RepairAssign();
                            List<RepairAssign> repairAssignMap = repairAssign.find("repair_id = ?", repair_id);
                            String assign_id = repairAssignMap.get(0).getString("assign_id");
                            Map repairEmpMap = new HashMap();
                            repairEmpMap.put("assign_id", assign_id);
                            RepairAssignEmp repairAssignEmp = new RepairAssignEmp();
                            repairAssignEmp.delete("assign_id= ?", assign_id);
                            for (String user : (List<String>) data.get("users")) {
                                repairEmpMap.put("emp_id", user);
                                repairAssignEmp.fromMap(repairEmpMap);

                                if (repairAssignEmp.insert()) {
                                    dBstatus = true;
                                } else {
                                    dBstatus = false;

                                }
                            }

                        } else {
                            return fail("RepairAssign is update fail!!");
                        }

                    }
                } else {
                    return fail("Repair update fail !!!");
                }
                if (dBstatus) {
                    return success();
                } else {
                    return fail("fail");
                }

            }
        });
    }
    public class RepairQueryParam {

        String startDate;
        String endDate;
        String customer;
        String machine;
        String repair;
        List<String> status;
        List<String> urgency;

        public String getStartDate() {

            return startDate;
        }

        public String getEndDate() {

            return endDate;
        }

        public String getCustomer() {
            if (customer == "" || customer.equals("")) {
                return " ";
            } else {
                return " AND cus_id ='" + customer + "' ";
            }
        }

        public String getMachine() {
            if (machine == "" || machine.equals("")) {
                return " ";
            } else {
                return " AND machine_id ='" + machine + "' ";
            }
        }

        public String getRepair() {
            if (repair == "" || repair.equals("")) {
                return " ";
            } else {
                return " AND repair_id ='" + repair + "' ";
            }
        }

        public String getStatus() {
            String sqlString = "";
            if (status.size() > 1) {
                for (int i = 0; i < status.size(); i++) {
                    if (i == 0) {
                        sqlString += " AND  (status_id='" + status.get(i).toString() + "' ";
                    }else if(i==(status.size()-1)){
                        sqlString += " or status_id='" + status.get(i).toString() + "') ";
                    }else {
                        sqlString += " or status_id='" + status.get(i).toString() + "' ";
                    }

                }
            } else if(status.size()==1) {
                sqlString += " AND  status_id='" + status.get(0).toString() + "' ";
            }
            return sqlString;
        }

        public String getUrgency() {
            String sqlString = "";
            if (urgency.size() > 1) {
                for (int i = 0; i < urgency.size(); i++) {
                    if (i == 0) {
                        sqlString += " AND emergency='" + urgency.get(i).toString() + "' ";
                    }else if(i==(urgency.size()-1)){
                        sqlString += " or emergency='" + urgency.get(i).toString() + "' ";
                    }else {
                        sqlString += " or emergency='" + urgency.get(i).toString() + "' ";
                    }
                }
            } else if(urgency.size()==1){
                sqlString+= " AND emergency='" + urgency.get(0).toString() + "' ";
            }
            return sqlString;
        }

        public String getDateBetween(String startDate,String endDate){
            if((startDate.equals("")||startDate=="")||(endDate.equals("")||endDate=="")){
                return " create_time like '%' ";
            }else{
              return " create_time BETWEEN '" +startDate + "  00:00:00'  AND ' " + endDate + "  23:59:59' ";
            }

        }
    }
}
