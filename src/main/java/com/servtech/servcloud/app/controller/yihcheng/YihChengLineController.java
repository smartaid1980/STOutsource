package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.servtrack.Line;

import com.servtech.servcloud.app.model.yihcheng.LineMachine;
import com.servtech.servcloud.core.db.ActiveJdbc;

import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;

import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.*;

import static com.servtech.servcloud.app.controller.yihcheng.YihChengProductProcessQualityController.getToolMoldEmployee;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Kevin on 2020/8/12.
 */
@RestController
@RequestMapping("/yihcheng/line")
public class YihChengLineController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> insert(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long timeMillis = System.currentTimeMillis();

                Base.openTransaction();

                String line_id = data.get("line_id").toString();

                Line new_line = new Line();
                RecordAfter.putCreateAndModify(data, user, timeMillis);
                new_line.fromMap(data);
                new_line.insert();


                List<Map> machine_info = (List<Map>) data.get("machine_info");
                if (machine_info != null) {
                    for (Map machine : machine_info) {
                        LineMachine new_line_machine = new LineMachine();
                        RecordAfter.putCreateAndModify(machine, user, timeMillis);
                        new_line_machine.fromMap(machine);
                        new_line_machine.set("line_id", line_id);
                        new_line_machine.insert();
                    }
                }

                Base.commitTransaction();
                return success(line_id);
            });
        } catch (Exception e) {
            e.printStackTrace();
            Base.rollbackTransaction();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
//                Map<String, String> result = null;
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long timeMillis = System.currentTimeMillis();


                Base.openTransaction();

                String line_id = data.get("line_id").toString();
//                result.put("line_id", line_id);
                Object device_id = data.get("device_id");
                System.out.println(line_id);
                Line line = Line.findById(line_id);

                Line new_line = new Line();
                if (line != null) {
//                    if (device_id != null && device_id.toString().equals(line.getString("device_id"))) {
//                        result.put("device_id", device_id.toString());
//                    }
                    RecordAfter.putModify(data, user, timeMillis);
                    new_line.fromMap(data);
                    new_line.saveIt();

                } else {
                    RecordAfter.putCreateAndModify(data, user, timeMillis);
                    new_line.fromMap(data);
                    new_line.insert();
                }

                List<Map> machine_info = (List<Map>) data.get("machine_info");
                if (machine_info != null) {
                    LineMachine.delete("line_id =?", line_id);

                    for (Map machine : machine_info) {
                        LineMachine new_line_machine = new LineMachine();
                        RecordAfter.putCreateAndModify(machine, user, timeMillis);
                        new_line_machine.fromMap(machine);
                        new_line_machine.set("line_id", line_id);
                        new_line_machine.insert();
                    }
                }

                Base.commitTransaction();
                return success(line_id);
            });
        } catch (Exception e) {
            e.printStackTrace();
            Base.rollbackTransaction();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "machine", method = RequestMethod.DELETE)
    public RequestResult<?> delete(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String line_id = data.get("line_id").toString();
                LineMachine.delete("line_id =?", line_id);
                return success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }
}
