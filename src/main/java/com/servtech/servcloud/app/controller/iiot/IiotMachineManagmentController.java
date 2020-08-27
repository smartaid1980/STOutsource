package com.servtech.servcloud.app.controller.iiot;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.iiot.IiotDeptMachine;
import com.servtech.servcloud.app.model.iiot.IiotMachineAlarmFreq;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2017/6/22.
 */
@RestController
@RequestMapping("/iiot/machine-managment")
public class IiotMachineManagmentController {
    private static final Logger log = LoggerFactory.getLogger(IiotMachineManagmentController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/downtime-overtime/read", method = GET)
    public RequestResult<List<Map>> readDowntimeOvertime() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> machineDowntimeFreq = IiotMachineAlarmFreq.find("alarm_type = ?", "2").toMaps();
                return success(machineDowntimeFreq);
            }
        });
    }

    @RequestMapping(value = "/downtime-overtime/update", method = PUT)
    public RequestResult<String> updateDowntimeOvertime(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                IiotMachineAlarmFreq machineDowntimeFreq = new IiotMachineAlarmFreq();
                machineDowntimeFreq.fromMap(data);


                if (machineDowntimeFreq.saveIt()) {
                    return success("update success");
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }


    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> deptMachines = IiotDeptMachine.findAll().toMaps();
                return success(deptMachines);
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    IiotDeptMachine iiotDeptMachine = new IiotDeptMachine();
                    iiotDeptMachine.fromMap(data);
                    if (iiotDeptMachine.insert()) {
                        return success("create success");
                    } else {
                        return fail("create fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                IiotDeptMachine iiotDeptMachine = new IiotDeptMachine();
                iiotDeptMachine.fromMap(data);


                if (iiotDeptMachine.saveIt()) {
                    return success("update success");
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Object[] machineList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    System.out.println(new Gson().toJson(machineList));
                    int deleteSize = machineList.length;
                    for (int count = 0; count < deleteSize; count++) {
                        Map pks = (Map) machineList[count];
                        IiotDeptMachine.delete("machine_id = ? AND dept_id = ?", pks.get("machine_id"), pks.get("dept_id"));
                    }
                    return success("delete success");
                } catch (Exception e) {
                    e.printStackTrace();
                    log.warn("delete fail: ", e.getMessage());
                    return fail(e.getMessage());
                }
            }
        });
    }

}
