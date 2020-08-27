package com.servtech.servcloud.app.controller.storage;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.storage.Employee;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@RestController
@RequestMapping("/storage/employee")
public class StorageEmployeeController {
    private static final Logger LOG = LoggerFactory.getLogger(StorageEmployeeController.class);
    private static final RuleEnum RULE = RuleEnum.EMPLOYEE;
    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String last = "";
                Employee employee = Employee.findFirst("ORDER BY emp_id Desc");
                if (employee == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    int seq = Integer.parseInt(employee.getString("emp_id").substring(1));
                    last = RuleEnum.getSeq(RULE, seq);
                }
                data.put("emp_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                employee = new Employee().fromMap(data);
                if (employee.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }

    }










    @RequestMapping(value = "/qrcode", method = RequestMethod.GET)
    public void genQRCodeDoc(@RequestParam("emp_id[]") String[] ids) {

        ActiveJdbc.operTx(() -> {

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<Employee> thingList = Employee.find("emp_id IN (" + stringJoiner.toString() + ")", ids);
            StdQRCode stdQRCode = new StdQRCode();
            stdQRCode.genDoc(thingList.size());

            for (int i = 0; i < thingList.size(); i++) {
                Employee emp = thingList.get(i);
                Map<String, String> jsonObj = new HashMap<>();
                jsonObj.put("id", emp.getString("emp_id"));
                jsonObj.put("name", emp.getString("emp_name"));
                stdQRCode.addImg(i, new Gson().toJson(jsonObj));
                stdQRCode.addTexts(emp.getString("emp_org_id"));
                stdQRCode.addTexts(emp.getString("emp_name"));
                stdQRCode.next();
            }
            stdQRCode.write(response);
            stdQRCode.delete();
            return null;
        });

    }

}
